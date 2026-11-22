import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import AnchorRoundedIcon from '@mui/icons-material/AnchorRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export const ICONS: Record<string, SvgIconComponent> = {
  accessibility: AccessibilityNewRoundedIcon,
  async: SyncRoundedIcon,
  dsa: AccountTreeRoundedIcon,
  'design-system': WidgetsRoundedIcon,
  dom: WebRoundedIcon,
  forms: EditNoteRoundedIcon,
  polyfills: BuildRoundedIcon,
  lodash: FunctionsRoundedIcon,
  hooks: AnchorRoundedIcon,
  state: StorageRoundedIcon,
  performance: SpeedRoundedIcon,
  security: SecurityRoundedIcon,
  book: MenuBookRoundedIcon,
  architecture: ArchitectureRoundedIcon,
  behavioral: RecordVoiceOverRoundedIcon,
  lead: MilitaryTechRoundedIcon,
  code: CodeRoundedIcon,
  resume: DescriptionRoundedIcon,
};

export function NamedIcon({
  name,
  ...rest
}: { name: string } & React.ComponentProps<SvgIconComponent>) {
  const Icon = ICONS[name] ?? CodeRoundedIcon;
  return <Icon {...rest} />;
}
