import fs from 'fs/promises';
import path from 'path';

export interface ToolConfig {
  toolName: string;
  enabled: boolean;
}

export class ToolConfigManager {
  private configPath: string;
  private toolConfigs: Map<string, boolean> = new Map();

  constructor(configPath?: string) {
    if (configPath) {
      this.configPath = path.resolve(configPath);
    } else {
      // Default to tool-config.json in the directory where the script is located
      // This ensures consistency regardless of working directory
      const scriptDir = path.dirname(new URL(import.meta.url).pathname);
      const projectRoot = path.resolve(scriptDir, '..');
      this.configPath = path.join(projectRoot, 'tool-config.json');
    }
  }

  /**
   * Initialize the config manager by loading existing config or creating default
   */
  public async initialize(allToolNames: string[]): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      // If config doesn't exist, create default (all tools disabled)
      console.log(
        'Creating default tool configuration with all tools disabled'
      );
      await this.createDefaultConfig(allToolNames);
    }
  }

  /**
   * Load tool configuration from JSON file
   */
  private async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const configs: ToolConfig[] = JSON.parse(configData);

      this.toolConfigs.clear();
      configs.forEach(config => {
        this.toolConfigs.set(config.toolName, config.enabled);
      });

      console.log(
        `Loaded tool configuration: ${configs.length} tools configured`
      );
    } catch (error) {
      throw new Error(`Failed to load tool configuration: ${error}`);
    }
  }

  /**
   * Create default configuration with all tools disabled
   */
  private async createDefaultConfig(allToolNames: string[]): Promise<void> {
    const defaultConfigs: ToolConfig[] = allToolNames.map(toolName => ({
      toolName,
      enabled: false,
    }));

    await this.saveConfig(defaultConfigs);

    // Update internal map
    this.toolConfigs.clear();
    defaultConfigs.forEach(config => {
      this.toolConfigs.set(config.toolName, config.enabled);
    });
  }

  /**
   * Save tool configuration to JSON file
   */
  private async saveConfig(configs: ToolConfig[]): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(configs, null, 2));
      console.log(`Saved tool configuration to ${this.configPath}`);
    } catch (error) {
      throw new Error(`Failed to save tool configuration: ${error}`);
    }
  }

  /**
   * Check if a tool is enabled
   */
  public isToolEnabled(toolName: string): boolean {
    return this.toolConfigs.get(toolName) ?? false;
  }

  /**
   * Enable or disable a tool
   */
  public async setToolEnabled(
    toolName: string,
    enabled: boolean
  ): Promise<void> {
    this.toolConfigs.set(toolName, enabled);
    await this.saveCurrentConfig();
  }

  /**
   * Get all tool configurations
   */
  public getAllConfigs(): ToolConfig[] {
    return Array.from(this.toolConfigs.entries()).map(
      ([toolName, enabled]) => ({
        toolName,
        enabled,
      })
    );
  }

  /**
   * Get enabled tools only
   */
  public getEnabledTools(): string[] {
    return Array.from(this.toolConfigs.entries())
      .filter(([_, enabled]) => enabled)
      .map(([toolName, _]) => toolName);
  }

  /**
   * Save current configuration to file
   */
  private async saveCurrentConfig(): Promise<void> {
    const configs = this.getAllConfigs();
    await this.saveConfig(configs);
  }

  /**
   * Update configuration for new tools (adds them as disabled by default)
   */
  public async updateWithNewTools(allToolNames: string[]): Promise<void> {
    let hasChanges = false;

    // Add any new tools as disabled
    for (const toolName of allToolNames) {
      if (!this.toolConfigs.has(toolName)) {
        this.toolConfigs.set(toolName, false);
        hasChanges = true;
      }
    }

    // Remove tools that no longer exist
    for (const toolName of this.toolConfigs.keys()) {
      if (!allToolNames.includes(toolName)) {
        this.toolConfigs.delete(toolName);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.saveCurrentConfig();
      console.log('Updated tool configuration with new/removed tools');
    }
  }
}
