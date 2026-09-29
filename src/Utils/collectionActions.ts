import { ActionSheetAction } from '../Components/Regular/ActionSheet';
import { CollectionStatus } from '../Types';
import { Theme } from './constants';

const STATUS_META: Record<CollectionStatus, { label: string; icon: string; color: (t: Theme) => string }> = {
  will_watch: { label: 'Want to Watch', icon: 'bookmark', color: t => t.colors.warning },
  watching: { label: 'Currently Watching', icon: 'play-circle', color: t => t.colors.primary },
  watched: { label: 'Watched', icon: 'checkmark-circle', color: t => t.colors.success },
};

const ORDER: CollectionStatus[] = ['will_watch', 'watching', 'watched'];

/**
 * One action per collection, with the same icons and colors as the Home stats,
 * optionally skipping the item's current collection.
 */
export const collectionStatusActions = (
  theme: Theme,
  onSelect: (status: CollectionStatus) => void,
  { exclude, prefix = '' }: { exclude?: CollectionStatus; prefix?: string } = {},
): ActionSheetAction[] =>
  ORDER.filter(status => status !== exclude).map(status => ({
    label: `${prefix}${STATUS_META[status].label}`,
    icon: STATUS_META[status].icon,
    iconColor: STATUS_META[status].color(theme),
    onPress: () => onSelect(status),
  }));
