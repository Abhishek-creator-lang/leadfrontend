import { Card, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Section } from '@/components/Section';
import { StatCard } from '@/components/StatCard';
import { getQuestion } from '@/content';
import { PageHeader } from '@/layout/Page';
import { PATHS, questionPath } from '@/routes/paths';
import { progressOverview } from '@/server/repositories/progress';
import { userStats } from '@/server/repositories/users';
import { LinkButton, TextLink } from '@/components/links';

export default async function AdminOverviewPage() {
  const [users, progress] = await Promise.all([userStats(), progressOverview()]);
  const totalUsers = Object.values(users.byRole).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Admin overview"
        subtitle="Users, sign-ups and learner activity across the platform."
        action={
          <LinkButton
            href={PATHS.adminNewUser}
            variant="contained"
            startIcon={<PersonAddAlt1RoundedIcon />}
          >
            Add user
          </LinkButton>
        }
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<GroupRoundedIcon color="primary" />}
            label="Users"
            value={totalUsers}
            hint={`${users.byRole.admin + users.byRole.super_admin} admins · ${users.byRole.learner} learners`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SchoolRoundedIcon color="success" />}
            label="Active learners (7 days)"
            value={progress.activeLearners7d}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpRoundedIcon color="secondary" />}
            label="New sign-ups (7 days)"
            value={users.signups7d}
            hint={`${users.signups30d} in the last 30 days`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PersonAddAlt1RoundedIcon color="warning" />}
            label="Pending accounts"
            value={users.byStatus.pending}
            hint={`${users.byStatus.inactive} deactivated`}
          />
        </Grid>
      </Grid>

      <Section title="Most completed questions">
        <Card>
          {progress.topCompleted.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No completions yet.
            </Typography>
          ) : (
            <List dense>
              {progress.topCompleted.map(({ questionId, count }) => {
                const q = getQuestion(questionId);
                return (
                  <ListItem
                    key={questionId}
                    secondaryAction={<Typography variant="body2">{count}</Typography>}
                  >
                    <ListItemText
                      primary={
                        q ? (
                          <TextLink href={questionPath(q)} color="inherit" underline="hover">
                            {q.title}
                          </TextLink>
                        ) : (
                          questionId
                        )
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Card>
      </Section>
    </>
  );
}
