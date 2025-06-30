import type { DataFlow, FlowVersion, VersionDiff, MergeResult } from "@/types/data-transformation"

export class FlowVersionControlService {
  private versions = new Map<string, FlowVersion[]>()
  private branches = new Map<string, Map<string, FlowVersion>>()

  async createVersion(
    flowId: string,
    flow: DataFlow,
    message: string,
    author: string,
    parentVersion?: string,
  ): Promise<FlowVersion> {
    const version: FlowVersion = {
      id: `v${Date.now()}`,
      flowId,
      version: this.getNextVersionNumber(flowId, parentVersion),
      flow: this.deepClone(flow),
      message,
      author,
      createdAt: new Date().toISOString(),
      parentVersion,
      tags: [],
      metadata: {
        checksum: this.calculateChecksum(flow),
        size: JSON.stringify(flow).length,
        transformationCount: flow.transformations?.length || 0,
        sourceCount: flow.sources?.length || 0,
        destinationCount: flow.destinations?.length || 0,
      },
    }

    // Store version
    if (!this.versions.has(flowId)) {
      this.versions.set(flowId, [])
    }
    this.versions.get(flowId)!.push(version)

    return version
  }

  async getVersions(flowId: string): Promise<FlowVersion[]> {
    return this.versions.get(flowId) || []
  }

  async getVersion(flowId: string, versionId: string): Promise<FlowVersion | null> {
    const versions = this.versions.get(flowId) || []
    return versions.find((v) => v.id === versionId) || null
  }

  async getLatestVersion(flowId: string, branch = "main"): Promise<FlowVersion | null> {
    const versions = this.versions.get(flowId) || []
    if (versions.length === 0) return null

    // For now, return the most recent version
    // In a full implementation, this would consider branches
    return versions[versions.length - 1]
  }

  async revertToVersion(flowId: string, versionId: string, message: string, author: string): Promise<FlowVersion> {
    const targetVersion = await this.getVersion(flowId, versionId)
    if (!targetVersion) {
      throw new Error(`Version ${versionId} not found for flow ${flowId}`)
    }

    // Create a new version with the reverted flow
    return this.createVersion(flowId, targetVersion.flow, `${message} (reverted to ${targetVersion.version})`, author)
  }

  async compareVersions(flowId: string, fromVersionId: string, toVersionId: string): Promise<VersionDiff> {
    const fromVersion = await this.getVersion(flowId, fromVersionId)
    const toVersion = await this.getVersion(flowId, toVersionId)

    if (!fromVersion || !toVersion) {
      throw new Error("One or both versions not found")
    }

    return this.calculateDiff(fromVersion.flow, toVersion.flow)
  }

  async createBranch(flowId: string, branchName: string, fromVersionId: string, author: string): Promise<FlowVersion> {
    const sourceVersion = await this.getVersion(flowId, fromVersionId)
    if (!sourceVersion) {
      throw new Error(`Source version ${fromVersionId} not found`)
    }

    if (!this.branches.has(flowId)) {
      this.branches.set(flowId, new Map())
    }

    const flowBranches = this.branches.get(flowId)!
    if (flowBranches.has(branchName)) {
      throw new Error(`Branch ${branchName} already exists`)
    }

    // Create branch version
    const branchVersion: FlowVersion = {
      ...sourceVersion,
      id: `${branchName}_${Date.now()}`,
      version: `${branchName}-1.0.0`,
      message: `Created branch ${branchName}`,
      author,
      createdAt: new Date().toISOString(),
      parentVersion: sourceVersion.id,
      branch: branchName,
    }

    flowBranches.set(branchName, branchVersion)
    return branchVersion
  }

  async mergeBranch(
    flowId: string,
    sourceBranch: string,
    targetBranch: string,
    message: string,
    author: string,
    strategy: "auto" | "manual" = "auto",
  ): Promise<MergeResult> {
    const flowBranches = this.branches.get(flowId)
    if (!flowBranches) {
      throw new Error(`No branches found for flow ${flowId}`)
    }

    const sourceVersion = flowBranches.get(sourceBranch)
    const targetVersion = flowBranches.get(targetBranch)

    if (!sourceVersion || !targetVersion) {
      throw new Error("Source or target branch not found")
    }

    // Calculate differences
    const diff = this.calculateDiff(targetVersion.flow, sourceVersion.flow)

    if (strategy === "auto" && this.hasConflicts(diff)) {
      return {
        success: false,
        conflicts: this.extractConflicts(diff),
        mergedFlow: null,
        message: "Automatic merge failed due to conflicts",
      }
    }

    // Perform merge
    const mergedFlow = this.mergeFlows(targetVersion.flow, sourceVersion.flow, diff)

    // Create merge version
    const mergeVersion = await this.createVersion(
      flowId,
      mergedFlow,
      `${message} (merged ${sourceBranch} into ${targetBranch})`,
      author,
      targetVersion.id,
    )

    // Update target branch
    flowBranches.set(targetBranch, mergeVersion)

    return {
      success: true,
      conflicts: [],
      mergedFlow,
      mergeVersion,
      message: "Merge completed successfully",
    }
  }

  async tagVersion(flowId: string, versionId: string, tag: string, message?: string): Promise<void> {
    const version = await this.getVersion(flowId, versionId)
    if (!version) {
      throw new Error(`Version ${versionId} not found`)
    }

    version.tags.push({
      name: tag,
      message: message || "",
      createdAt: new Date().toISOString(),
    })
  }

  async getVersionHistory(
    flowId: string,
    options: {
      limit?: number
      branch?: string
      author?: string
      since?: string
      until?: string
    } = {},
  ): Promise<FlowVersion[]> {
    let versions = this.versions.get(flowId) || []

    // Apply filters
    if (options.author) {
      versions = versions.filter((v) => v.author === options.author)
    }

    if (options.since) {
      versions = versions.filter((v) => v.createdAt >= options.since!)
    }

    if (options.until) {
      versions = versions.filter((v) => v.createdAt <= options.until!)
    }

    if (options.branch) {
      versions = versions.filter((v) => v.branch === options.branch)
    }

    // Sort by creation date (newest first)
    versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply limit
    if (options.limit) {
      versions = versions.slice(0, options.limit)
    }

    return versions
  }

  private getNextVersionNumber(flowId: string, parentVersion?: string): string {
    const versions = this.versions.get(flowId) || []

    if (versions.length === 0) {
      return "1.0.0"
    }

    if (parentVersion) {
      const parent = versions.find((v) => v.id === parentVersion)
      if (parent) {
        const [major, minor, patch] = parent.version.split(".").map(Number)
        return `${major}.${minor}.${patch + 1}`
      }
    }

    // Get the latest version and increment patch
    const latestVersion = versions[versions.length - 1]
    const [major, minor, patch] = latestVersion.version.split(".").map(Number)
    return `${major}.${minor}.${patch + 1}`
  }

  private calculateChecksum(flow: DataFlow): string {
    // Simple checksum calculation
    const content = JSON.stringify(flow, Object.keys(flow).sort())
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  private calculateDiff(fromFlow: DataFlow, toFlow: DataFlow): VersionDiff {
    const changes: any[] = []

    // Compare basic properties
    const basicProps = ["name", "description", "status"]
    basicProps.forEach((prop) => {
      if (fromFlow[prop as keyof DataFlow] !== toFlow[prop as keyof DataFlow]) {
        changes.push({
          type: "modified",
          path: prop,
          oldValue: fromFlow[prop as keyof DataFlow],
          newValue: toFlow[prop as keyof DataFlow],
        })
      }
    })

    // Compare transformations
    const fromTransformations = fromFlow.transformations || []
    const toTransformations = toFlow.transformations || []

    this.compareArrays(fromTransformations, toTransformations, "transformations", changes)

    // Compare sources
    const fromSources = fromFlow.sources || []
    const toSources = toFlow.sources || []

    this.compareArrays(fromSources, toSources, "sources", changes)

    // Compare destinations
    const fromDestinations = fromFlow.destinations || []
    const toDestinations = toFlow.destinations || []

    this.compareArrays(fromDestinations, toDestinations, "destinations", changes)

    return {
      changes,
      summary: {
        totalChanges: changes.length,
        additions: changes.filter((c) => c.type === "added").length,
        modifications: changes.filter((c) => c.type === "modified").length,
        deletions: changes.filter((c) => c.type === "removed").length,
      },
    }
  }

  private compareArrays(fromArray: any[], toArray: any[], path: string, changes: any[]): void {
    // Find additions
    toArray.forEach((item, index) => {
      const existsInFrom = fromArray.some((fromItem) => JSON.stringify(fromItem) === JSON.stringify(item))
      if (!existsInFrom) {
        changes.push({
          type: "added",
          path: `${path}[${index}]`,
          newValue: item,
        })
      }
    })

    // Find removals
    fromArray.forEach((item, index) => {
      const existsInTo = toArray.some((toItem) => JSON.stringify(toItem) === JSON.stringify(item))
      if (!existsInTo) {
        changes.push({
          type: "removed",
          path: `${path}[${index}]`,
          oldValue: item,
        })
      }
    })

    // Find modifications (simplified)
    const minLength = Math.min(fromArray.length, toArray.length)
    for (let i = 0; i < minLength; i++) {
      if (JSON.stringify(fromArray[i]) !== JSON.stringify(toArray[i])) {
        changes.push({
          type: "modified",
          path: `${path}[${i}]`,
          oldValue: fromArray[i],
          newValue: toArray[i],
        })
      }
    }
  }

  private hasConflicts(diff: VersionDiff): boolean {
    // Simple conflict detection - in practice, this would be more sophisticated
    return diff.changes.some(
      (change) =>
        change.type === "modified" && change.path.includes("transformations") && change.oldValue && change.newValue,
    )
  }

  private extractConflicts(diff: VersionDiff): any[] {
    return diff.changes
      .filter((change) => change.type === "modified" && change.oldValue && change.newValue)
      .map((change) => ({
        path: change.path,
        conflict: "Both versions modified the same element",
        baseValue: change.oldValue,
        incomingValue: change.newValue,
      }))
  }

  private mergeFlows(baseFlow: DataFlow, incomingFlow: DataFlow, diff: VersionDiff): DataFlow {
    // Simple merge strategy - in practice, this would be more sophisticated
    const mergedFlow = this.deepClone(baseFlow)

    diff.changes.forEach((change) => {
      if (change.type === "added") {
        // Add new elements
        this.applyAddition(mergedFlow, change)
      } else if (change.type === "modified" && !this.isConflicting(change)) {
        // Apply non-conflicting modifications
        this.applyModification(mergedFlow, change)
      }
    })

    return mergedFlow
  }

  private isConflicting(change: any): boolean {
    // Simple conflict detection
    return change.oldValue && change.newValue && JSON.stringify(change.oldValue) !== JSON.stringify(change.newValue)
  }

  private applyAddition(flow: DataFlow, change: any): void {
    // Simplified addition logic
    if (change.path.startsWith("transformations")) {
      if (!flow.transformations) flow.transformations = []
      flow.transformations.push(change.newValue)
    } else if (change.path.startsWith("sources")) {
      if (!flow.sources) flow.sources = []
      flow.sources.push(change.newValue)
    } else if (change.path.startsWith("destinations")) {
      if (!flow.destinations) flow.destinations = []
      flow.destinations.push(change.newValue)
    }
  }

  private applyModification(flow: DataFlow, change: any): void {
    // Simplified modification logic
    const pathParts = change.path.split(".")
    let current: any = flow

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = change.newValue
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  async createVersion(flowId: string, changes: any): Promise<{ version: string; id: string }> {
    return {
      version: "1.0.0",
      id: "version_" + Date.now(),
    }
  }
}
