import { test, expect } from "@playwright/test";
import fs from "node:fs";

const evidence = process.env.AIDRB_EVIDENCE || ".browser-test/evidence";
fs.mkdirSync(evidence, { recursive: true });

async function assertNoOverflow(page) {
  const metrics = await page.evaluate(() => {
    const viewport = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const scrollX = window.scrollX;
    const offenders = [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const documentLeft = rect.left + scrollX;
        const documentRight = rect.right + scrollX;
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || "",
          className:
            typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          documentLeft: Math.round(documentLeft * 10) / 10,
          documentRight: Math.round(documentRight * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      })
      .filter(
        (item) =>
          item.documentRight > viewport + 0.5 || item.documentLeft < -0.5,
      )
      .sort((a, b) => b.documentRight - a.documentRight)
      .slice(0, 12);
    return { viewport, scrollWidth, scrollX, offenders };
  });
  expect(
    metrics.scrollWidth,
    `Horizontal overflow diagnostics: ${JSON.stringify(metrics, null, 2)}`,
  ).toBeLessThanOrEqual(metrics.viewport);
}

async function setRange(locator, value) {
  await locator.evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  test(`${name}: Human Projection creative atlas, cross-media detail, dictionary and resources`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors = [];
    const requests = [];
    const failed = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) =>
      requests.push(new URL(request.url()).pathname),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        failed.push(`${response.status()} ${response.url()}`);
    });

    // Creative World is now the default Human projection. Startup still avoids
    // record/relations/resource payloads until a deeper surface needs them.
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Creative references, in view." }),
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".example-tile")).toHaveCount(28);
    await expect(page.locator(".creative-group")).toHaveCount(5);
    await expect(page.getByRole("link", { name: /Selections/ })).toHaveCount(0);
    expect(requests).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /ai-index|relations|records\/|search\.sqlite|resources\//,
        ),
      ]),
    );
    const startup = await page.evaluate(() =>
      [
        ...performance.getEntriesByType("navigation"),
        ...performance.getEntriesByType("resource"),
      ]
        .filter((entry) => entry.name.startsWith(location.origin))
        .map((entry) => ({
          url: new URL(entry.name).pathname,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize,
          transferSize: entry.transferSize,
        })),
    );
    const bodyBytes = startup.reduce(
      (sum, entry) => sum + entry.encodedBodySize,
      0,
    );
    expect(bodyBytes).toBeLessThan(170000);
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-atlas.png`,
      fullPage: true,
    });

    // Academic content remains intact and still exposes all 12 Chemistry topics.
    await page.getByRole("link", { name: /Open Chemistry/ }).click();
    await expect(
      page.getByRole("heading", { name: "Chemistry, in view." }),
    ).toBeVisible();
    await expect(page.locator(".topic-nav a")).toHaveCount(12);
    const topicLinks = await page
      .locator(".topic-nav a")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
    for (const href of topicLinks) {
      await page.locator(`.topic-nav a[href="${href}"]`).click();
      await expect(page.locator(".example-tile")).toHaveCount(4);
      await assertNoOverflow(page);
    }

    // Local LIVE academic Example remains interactive and visually first.
    await page.goto("/#example/ex:chemistry-reaction-profile");
    await expect(
      page.getByRole("heading", { name: "Reaction profile", exact: true }),
    ).toBeVisible();
    await expect(page.locator("output")).toContainText("Transition state");
    await expect(page.locator("#ai-build")).not.toHaveAttribute("open", "");
    await expect(page.locator("#provenance")).not.toHaveAttribute("open", "");
    expect(
      await page
        .locator(".detail-stage")
        .evaluate((element) => element.getBoundingClientRect().top),
    ).toBeLessThan(
      await page
        .locator("h1")
        .evaluate((element) => element.getBoundingClientRect().top),
    );
    await page.getByRole("slider").focus();
    await page.keyboard.press("Home");
    await expect(page.locator("output")).toContainText("Reactants");
    await page.keyboard.press("End");
    await expect(page.locator("output")).toContainText("Products");
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-live.png`,
      fullPage: true,
    });

    // Explore is an editorial stream, Creative-first, with refinement kept
    // secondary to browsing rhythm rather than exposed as a filter dashboard.
    await page.getByRole("link", { name: "Explore", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Find the mechanism, not the thumbnail." }),
    ).toBeVisible();
    await expect(page.locator(".explore-row")).toHaveCount(28);
    await expect(page.locator("#result-count")).toHaveText("28 references");
    await page.getByLabel("Search references").fill("archive");
    await expect(page.locator(".explore-row")).toHaveCount(2);
    await page.getByLabel("Search references").fill("");
    await page.locator("#refine summary").click();
    await page.getByLabel("Resource", { exact: true }).selectOption("yes");
    await expect(page.locator(".explore-row")).toHaveCount(7);
    await page.getByLabel("Resource", { exact: true }).selectOption("");
    await page.getByLabel("World", { exact: true }).selectOption("all");
    await page.getByLabel("Coverage", { exact: true }).selectOption("LIVE");
    await expect(page.locator(".explore-row")).toHaveCount(6);
    await page.getByLabel("Coverage", { exact: true }).selectOption("GAP");
    await expect(page.locator(".explore-row")).toHaveCount(26);
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-explore.png`,
      fullPage: true,
    });

    // External website reference: medium-aware, source-linked, not copied.
    await page.goto("/#example/ex:whole-earth-index");
    await expect(page.locator('#stage [data-presentation="editorial"]')).toBeVisible();
    await expect(page.locator("#stage")).toContainText(
      "Original source media is linked, not reproduced here.",
    );
    await expect(
      page.getByRole("link", { name: "Open original reference ↗" }),
    ).toHaveAttribute("href", "https://wholeearth.info/");
    await expect(page.locator(".resource-callout")).toHaveCount(1);
    await expect(page.locator("#select-example")).toHaveCount(0);
    await expect(page.locator(".data-id")).toContainText("ex:whole-earth-index");
    await expect(page.locator(".resource-callout")).toContainText(
      "not the source preview",
    );
    await expect(page.locator("#provenance")).not.toHaveAttribute("open", "");
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-example-editorial.png`,
      fullPage: true,
    });

    // Film/title sequence: a distinct moving-image presentation; no fake Resource.
    await page.goto("/#example/ex:aott-severance");
    await expect(page.locator('#stage [data-presentation="cinema"]')).toBeVisible();
    await expect(page.locator("#resources")).toContainText(
      "No reusable Resource has been extracted",
    );
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-example-cinema.png`,
      fullPage: true,
    });

    // Physical installation: spatial presentation semantics, external source only.
    await page.goto("/#example/ex:pulse-room");
    await expect(page.locator('#stage [data-presentation="spatial"]')).toBeVisible();
    await expect(page.locator("#resources")).toContainText(
      "No reusable Resource has been extracted",
    );
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-example-spatial.png`,
      fullPage: true,
    });

    // Dictionary: term → real Examples → Resource/Tool path, not definition-only.
    await page.getByRole("link", { name: "Dictionary", exact: true }).click();
    await page.getByLabel("Find a Concept").fill("archive as interface");
    await expect(page.locator(".dictionary-term")).toHaveCount(1);
    await expect(page.locator(".dictionary-term")).toContainText(
      "Runnable Resource",
    );
    await page.locator(".dictionary-term").click();
    await expect(
      page.getByRole("heading", { name: "Archive as interface", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".comparison-row")).toHaveCount(2);
    await expect(page.locator(".implementation-link")).toContainText(
      "Archive as interface",
    );
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-concept-archive.png`,
      fullPage: true,
    });

    await page.goto("/#concept/concept:semantic-zoom");
    await expect(page.locator(".comparison-row")).toHaveCount(1);
    await expect(page.locator(".implementation-path")).toContainText(
      "Semantic zoom levels",
    );
    await page.goto("/#concept/concept:kinetic-identity-system");
    await expect(page.locator(".comparison-row")).toHaveCount(3);
    await expect(page.locator(".implementation-path")).toContainText(
      "No Resource extracted yet.",
    );

    // All four Wave 01 Resource Packages are directly runnable in the Human view.
    const resourceCases = [
      {
        id: "resource:archive-as-interface",
        heading: "Archive as interface",
        check: async (frame) => {
          await expect(frame.locator(".archive-row")).toHaveCount(4);
          await frame.locator("#q").fill("Motion");
          await expect(frame.locator(".archive-row")).toHaveCount(1);
          await expect(frame.locator("body")).toContainText("Motion Grammar");
        },
      },
      {
        id: "resource:editable-model-sandbox",
        heading: "Editable model sandbox",
        check: async (frame) => {
          await expect(frame.locator("#summary")).toContainText("A = 40.0%");
          await setRange(frame.locator("#a"), 100);
          await expect(frame.locator("#summary")).toContainText("A = 62.5%");
        },
      },
      {
        id: "resource:linked-computation-inspector",
        heading: "Linked computation inspector",
        check: async (frame) => {
          await expect(frame.locator(".grid button")).toHaveCount(16);
          await frame.locator(".grid button").nth(15).click();
          await expect(frame.locator("#detail")).toContainText("selection");
        },
      },
      {
        id: "resource:semantic-zoom-levels",
        heading: "Semantic zoom levels",
        check: async (frame) => {
          await expect(frame.locator("#level")).toHaveText("overview");
          await setRange(frame.locator("#scale"), 4);
          await expect(frame.locator("#level")).toHaveText("detail");
          await expect(frame.locator("#detail")).toContainText(
            "Detailed metadata",
          );
        },
      },
    ];
    for (const resourceCase of resourceCases) {
      await page.goto(`/#resource/${resourceCase.id}`);
      await expect(
        page.getByRole("heading", {
          name: resourceCase.heading,
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".resource-demo-label")).toContainText(
        "not a preview of its source Example",
      );
      await expect(page.locator("iframe.resource-demo")).toBeVisible();
      const frame = page.frameLocator("iframe.resource-demo");
      await resourceCase.check(frame);
      await assertNoOverflow(page);
    }
    await page.screenshot({
      path: `${evidence}/${name}-human-resource.png`,
      fullPage: true,
    });

    // Human projection ends at inspection/comparison; machine commit/lock stays outside the browser UI.
    await page.goto("/#example/ex:whole-earth-index");
    await expect(page.locator("#select-example")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Selections/ })).toHaveCount(0);
    await assertNoOverflow(page);

    // Stable record paths remain filename-safe; no colon IDs leak into URLs.
    expect(requests.filter((path) => path.includes("/records/"))).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/:|%3a/i)]),
    );
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);

    fs.writeFileSync(
      `${evidence}/${name}-browser.json`,
      JSON.stringify(
        {
          viewport: { width, height },
          startup,
          bodyBytes,
          transferBytes: startup.reduce(
            (sum, entry) => sum + entry.transferSize,
            0,
          ),
          errors,
          failed,
          checks: [
            "Creative World default atlas / 28 cross-media references",
            "Academic Chemistry pack / 12 topic inventories",
            "LIVE academic interaction",
            "Explore editorial stream and refinement",
            "website / cinema / installation presentation semantics",
            "Concept -> Examples -> Resource/Tool path",
            "four runnable Wave 01 Resource demos",
            "External Reference != Resource demo",
            "no Human selection / commit / download surface",
            "stable IDs / no mobile overflow / no console errors",
          ],
        },
        null,
        2,
      ) + "\n",
    );
  });

  test(`${name}: lossless provenance stays safe in visual-first Example detail`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const path = JSON.parse(
      fs.readFileSync("catalog/web-index.json", "utf8"),
    ).examples.find((example) => example.id === "ex:chemistry-reaction-profile")
      .resolve_path;
    const resolved = JSON.parse(fs.readFileSync(path, "utf8"));
    const base = resolved.sources[0];
    resolved.sources.push(
      {
        ...base,
        id: "source:test-file",
        title: "Uploaded diagram",
        locator_type: "file",
        locator: "uploads/反应 profile.pdf",
      },
      {
        ...base,
        id: "source:test-image",
        title: "Local screenshot",
        locator_type: "image",
        locator: "screenshots/reaction.png",
      },
      {
        ...base,
        id: "source:test-prompt",
        title: "Original prompt",
        locator_type: "prompt",
        locator: "<img src=x onerror=alert(1)> Draw ΔH",
      },
    );
    await page.route(`**/${path}`, (route) => route.fulfill({ json: resolved }));
    await page.goto("/#example/ex:chemistry-reaction-profile");
    await page.locator("#provenance summary").click();
    const provenance = page.locator("#provenance");
    await expect(provenance).toContainText("uploads/反应 profile.pdf");
    await expect(provenance).toContainText("screenshots/reaction.png");
    await expect(provenance).toContainText(
      "<img src=x onerror=alert(1)> Draw ΔH",
    );
    await expect(provenance.locator("img")).toHaveCount(0);
    await expect(
      provenance.getByRole("link", {
        name: /Uploaded diagram|Local screenshot|Original prompt/,
      }),
    ).toHaveCount(0);
    const links = await provenance
      .locator("a")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((url) => /^https?:\/\//.test(url))).toBe(true);
    await assertNoOverflow(page);
    await page.screenshot({
      path: `${evidence}/${name}-human-provenance-fixture.png`,
      fullPage: true,
    });
  });
}