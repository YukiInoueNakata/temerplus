// 2 つの訳文を続けて表示するときの間（日本語は詰める・英語などは空白 1 つ）
// JSX で {t('a')}{t('b')} と改行だけで並べると、英語では "changed.Endpoint" のように文がくっつくため
import i18n from '../i18n';

export function sentenceGap(lng: string = i18n.language): string {
  return lng.startsWith('ja') || lng.startsWith('zh') ? '' : ' ';
}
