import type { Metadata } from 'next';
import { Card, Chip, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { TextLink } from '@/components/links';
import { Section } from '@/components/Section';
import { PageHeader } from '@/layout/Page';
import { requireAdmin } from '@/server/auth/dal';
import { contentCounts, recentlyEdited } from '@/server/repositories/content';
import { formatDateTime } from '@/utils/date';
import {
  CONTENT_TYPE_INFO,
  CONTENT_TYPE_ORDER,
  contentEditPath,
  contentListPath,
} from '@/views/admin/content/contentTypes';
import { LinkCardArea } from '@/views/admin/content/LinkCardArea';

export const metadata: Metadata = { title: 'Content' };

export default async function ContentHomePage() {
  await requireAdmin();
  const [counts, recent] = await Promise.all([contentCounts(), recentlyEdited()]);

  return (
    <>
      <PageHeader title="Content" subtitle="Everything learners see. Edit drafts, then publish when ready." />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {CONTENT_TYPE_ORDER.map((type) => {
          const info = CONTENT_TYPE_INFO[type];
          const c = counts[type] ?? { draft: 0, published: 0, changed: 0, archived: 0 };
          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Card sx={{ height: '100%' }}>
                <LinkCardArea href={contentListPath(type)}>
                  <Typography variant="h6" fontWeight={700}>
                    {info.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, flex: 1 }}>
                    {info.description}
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip size="small" color="success" label={`${c.published} published`} />
                    {c.changed > 0 && <Chip size="small" color="warning" label={`${c.changed} with changes`} />}
                    {c.draft > 0 && <Chip size="small" label={`${c.draft} drafts`} />}
                    {c.archived > 0 && <Chip size="small" variant="outlined" label={`${c.archived} archived`} />}
                  </Stack>
                </LinkCardArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Section title="Recently edited">
        <Card>
          {recent.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Nothing has been edited in the CMS yet.
            </Typography>
          ) : (
            <List dense>
              {recent.map((r) => (
                <ListItem key={r.id}>
                  <ListItemText
                    primary={
                      <TextLink href={contentEditPath(r.type, r.id)} underline="hover">
                        {r.title}
                      </TextLink>
                    }
                    secondary={`${CONTENT_TYPE_INFO[r.type].label} · ${formatDateTime(r.updatedAt)}${r.updatedBy ? ` · ${r.updatedBy}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      </Section>
    </>
  );
}

