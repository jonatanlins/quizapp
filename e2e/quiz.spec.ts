import { expect, type Page, test } from '@playwright/test';

async function startQuiz(page: Page, username: string, daily = false, learn = false) {
  await page.goto('/');
  await page.getByLabel('YOUR USERNAME').fill(username);
  if (learn) await page.getByRole('checkbox', { name: /Learn mode/ }).check();
  await page
    .getByRole('button', { name: daily ? 'Take the daily challenge' : 'Start AI Fundamentals' })
    .click();
  await expect(page.getByRole('heading', { name: 'Let’s find out.' })).toBeVisible();
}

async function answerQuestion(page: Page, index = 0) {
  const choices = page.locator('.option');
  await expect(choices).toHaveCount(4);
  await choices.nth(index).click();
  await expect(page.locator('.feedback')).toBeVisible();
  await expect(choices.first()).toBeDisabled();
}

test('quiz, Learn Mode, results, history, leaderboard and retake', async ({ page }) => {
  await startQuiz(page, 'E2E Learner', false, true);
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByLabel(`Question ${i} of 5`)).toBeVisible();
    await expect(page.getByText('A little context')).toBeVisible();
    await answerQuestion(page);
    await page.getByRole('button', { name: i === 5 ? 'See my results' : 'Next question' }).click();
  }
  await expect(page.getByText('QUIZ COMPLETE')).toBeVisible();
  const score = Number((await page.locator('.score-disc strong').innerText()).split('/')[0]);
  await expect(page.locator('.score-disc')).toContainText(`${score * 20}% CORRECT`);
  await page.getByRole('button', { name: 'My progress' }).click();
  await expect(page.getByText('Attempt history.')).toBeVisible();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button', { name: 'My progress' }).click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Leaderboard' }).click();
  await page.getByRole('button', { name: 'Learn mode' }).click();
  await expect(
    page.locator('.board-row').filter({ hasText: 'E2E Learner' }).locator('b')
  ).toHaveText(String(score));
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  await page.getByRole('button', { name: 'Take it again' }).click();
  await expect(page.getByLabel('Question 1 of 5')).toBeVisible();
  for (let i = 1; i <= 5; i++) {
    await answerQuestion(page);
    await page.getByRole('button', { name: i === 5 ? 'See my results' : 'Next question' }).click();
  }
  await expect(page.getByText('QUIZ COMPLETE')).toBeVisible();
  const secondScore = Number((await page.locator('.score-disc strong').innerText()).split('/')[0]);
  await page.getByRole('button', { name: 'My progress' }).click();
  await expect(page.locator('.history-row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Leaderboard' }).click();
  await page.getByRole('button', { name: 'Learn mode' }).click();
  await expect(
    page.locator('.board-row').filter({ hasText: 'E2E Learner' }).locator('b')
  ).toHaveText(String(score + secondScore));
});

test('lost answer response survives refresh and does not allow another answer', async ({
  page,
}) => {
  await startQuiz(page, 'E2E Recovery');
  const question = await page.locator('.question-heading h2').innerText();
  await page.locator('#chaos').selectOption('after');
  await page.locator('.option').first().click();
  await expect(page.locator('.notice.error')).toContainText('Simulated response loss');
  await expect(page.locator('.option').first()).toBeDisabled();
  await page.reload();
  await expect(page.locator('.feedback')).toBeVisible();
  await expect(page.locator('.question-heading h2')).toHaveText(question);
  await expect(page.getByLabel('Question 1 of 5')).toBeVisible();
  await expect(page.locator('.option').first()).toBeDisabled();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByLabel('Question 2 of 5')).toBeVisible();
});

test('start failure can be retried with the saved request', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('YOUR USERNAME').fill('E2E Retry');
  await page.locator('#chaos').selectOption('before');
  await page.getByRole('button', { name: 'Start AI Fundamentals' }).click();
  await expect(page.locator('.notice.error')).toContainText('Simulated failure');
  await page.locator('#chaos').selectOption('off');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByLabel('Question 1 of 5')).toBeVisible();
});

test('same UTC daily challenge is shared and resumes after reload', async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  try {
    const first = await a.newPage(),
      second = await b.newPage();
    await Promise.all([
      startQuiz(first, 'E2E Daily A', true),
      startQuiz(second, 'E2E Daily B', true),
    ]);
    await expect(first.locator('.quiz-breadcrumb')).toContainText(
      new Date().toISOString().slice(0, 10)
    );
    for (let i = 1; i <= 3; i++) {
      await expect(first.getByLabel(`Question ${i} of 5`)).toBeVisible();
      await expect(second.locator('.question-heading h2')).toHaveText(
        await first.locator('.question-heading h2').innerText()
      );
      if (i < 3) {
        await Promise.all([answerQuestion(first), answerQuestion(second)]);
        await Promise.all([
          first.getByRole('button', { name: 'Next question' }).click(),
          second.getByRole('button', { name: 'Next question' }).click(),
        ]);
      }
    }
    await first.reload();
    await expect(first.getByLabel('Question 3 of 5')).toBeVisible();
    await expect(first.locator('.question-heading h2')).toHaveText(
      await second.locator('.question-heading h2').innerText()
    );
  } finally {
    await a.close();
    await b.close();
  }
});

test('two tabs cannot answer the same question twice', async ({ context, page }) => {
  await startQuiz(page, 'E2E Tabs');
  const other = await context.newPage();
  await other.goto('/');
  await expect(other.getByLabel('Question 1 of 5')).toBeVisible();
  await page.locator('.option').first().dblclick({ delay: 10 });
  await expect(page.locator('.feedback')).toBeVisible();
  await expect(other.locator('.feedback')).toBeVisible();
  await expect(page.locator('.option.correct span').nth(1)).toHaveText(
    await other.locator('.option.correct span').nth(1).innerText()
  );
  await page.reload();
  await expect(page.locator('.feedback')).toBeVisible();
  await other.close();
});

test('expired session offers recovery', async ({ page }) => {
  await startQuiz(page, 'E2E Expiry');
  await page.route('**/api/sessions/*', async (route) => {
    if (route.request().method() === 'GET')
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' },
        }),
      });
    else await route.continue();
  });
  await page.reload();
  await expect(page.locator('.notice.error')).toContainText('no longer available');
  await page.getByRole('button', { name: 'Start a new quiz' }).click();
  await expect(page.getByRole('heading', { name: 'Pick your rabbit hole.' })).toBeVisible();
});

test('unavailable storage blocks an unsafe start and explains why', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'quizapp:v1') throw new DOMException('Storage blocked', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/');
  await page.getByLabel('YOUR USERNAME').fill('E2E Storage');
  await page.getByRole('button', { name: 'Start AI Fundamentals' }).click();
  await expect(page.getByRole('alert').first()).toContainText('Browser storage is unavailable');
  await expect(
    page.getByText('Could not save this request. Enable browser storage to start safely.')
  ).toBeVisible();
});

test('corrupt local storage is reported and can be reset', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('quizapp:v1', '{bad json'));
  await page.goto('/');
  await expect(page.locator('.storage-warning')).toContainText('invalid data');
  await page.getByRole('button', { name: 'Reset saved data' }).click();
  await expect(page.locator('.storage-warning')).toHaveCount(0);
});

test('simultaneous conflicting API answers accept only one and replay the winning key', async ({
  request,
}) => {
  const started = await request.post('/api/sessions', {
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    data: {
      categoryId: 'daily',
      userId: crypto.randomUUID(),
      username: 'E2E Race',
      learnMode: false,
    },
  });
  expect(started.ok()).toBeTruthy();
  const { token, session } = await started.json();
  expect(session.question).not.toHaveProperty('correctOptionId');
  expect(session.question).not.toHaveProperty('explanation');
  const url = `/api/sessions/${session.id}/answers`;
  const payloads = session.question.options
    .slice(0, 2)
    .map((option: { id: string }) => ({ questionId: session.question.id, optionId: option.id }));
  const keys = [crypto.randomUUID(), crypto.randomUUID()];
  const responses = await Promise.all(
    payloads.map((data: unknown, i: number) =>
      request.post(url, {
        headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': keys[i] },
        data,
      })
    )
  );
  expect(responses.map((response) => response.status()).sort()).toEqual([200, 409]);
  const winner = responses.findIndex((response) => response.status() === 200);
  const result = await responses[winner].json();
  const replay = await request.post(url, {
    headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': keys[winner] },
    data: payloads[winner],
  });
  expect(replay.status()).toBe(200);
  expect(await replay.json()).toEqual(result);
});
