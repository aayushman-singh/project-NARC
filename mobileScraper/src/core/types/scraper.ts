export interface ScraperConfig {
  username: string;
  password: string;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  abstract setup(): Promise<boolean>;
  abstract login(): Promise<boolean>;
  abstract close(): Promise<void>;
}
