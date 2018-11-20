import { ModeStyles } from './style.interface';

export interface ComponentOptions {
  selector: string;
  styleUrl?: string;
  styleUrls?: string[] | ModeStyles;
  styles?: string;
  scoped?: boolean;
  shadow?: boolean;
  assetsDir?: string;
  assetsDirs?: string[];
}