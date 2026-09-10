import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const evidence = process.env.AIDRB_EVIDENCE || ".browser-test/evidence";
fs.mkdirSync(evidence, { recursive: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  test(`${name}: visual discovery, navigation, selection, payload and all live models`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors = [],
      requests = [],
      failed = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("request", (r) => requests.push(new URL(r.url()).pathname));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Chemistry, in view." }),
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(requests).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /ai-index|relations|records\/|decision-board|board\.js|search\.sqlite|resources\//,
        ),
      ]),
    );
    const startup = await page.evaluate(() =>
      [
        ...performance.getEntriesByType("navigation"),
        ...performance.getEntriesByType("resource"),
      ]
        .filter((r) => r.name.startsWith(location.origin))
        .map((r) => ({
          url: new URL(r.name).pathname,
          encodedBodySize: r.encodedBodySize,
          decodedBodySize: r.decodedBodySize,
          transferSize: r.transferSize,
        })),
    );
    const bodyBytes = startup.reduce((sum, r) => sum + r.encodedBodySize, 0);
    expect(bodyBytes).toBeLessThan(150000);
    const noOverflow = async () =>
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    await noOverflow();
    await page.screenshot({
      path: `${evidence}/${name}-atlas.png`,
      fullPage: true,
    });
    await page
      .locator(".card")
      .filter({
        has: page.getByRole("heading", {
          name: "Reaction profile",
          exact: true,
        }),
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Reaction profile", exact: true }),
    ).toBeVisible();
    await expect(page.locator("output")).toContainText("Transition state");
    await expect(page.locator("#ai-build")).not.toHaveAttribute("open", "");
    await expect(page.locator("#provenance")).not.toHaveAttribute("open", "");
    expect(
      await page
        .locator(".detail-stage")
        .evaluate((el) => el.getBoundingClientRect().top),
    ).toBeLessThan(
      await page.locator("h1").evaluate((el) => el.getBoundingClientRect().top),
    );
    await noOverflow();
    await page.screenshot({
      path: `${evidence}/${name}-example.png`,
      fullPage: true,
    });
    await page.getByRole("slider").focus();
    await page.keyboard.press("Home");
    await expect(page.locator("output")).toContainText("Reactants");
    await page.keyboard.press("End");
    await expect(page.locator("output")).toContainText("Products");
    await page.locator("#ai-build summary").click();
    await expect(page.locator("#ai-build")).toContainText(
      "concept:reaction-coordinate",
    );
    await page.locator("#provenance summary").click();
    await expect(page.locator("#provenance")).toContainText("Cambridge");
    await noOverflow();
    await page.getByRole("button", { name: "Add to selection" }).click();
    await page.getByRole("link", { name: "Selections 1" }).click();
    await page
      .getByLabel("Aspect notes")
      .fill("Keep ΔH and coordinate marker; avoid time claims.");
    await page.getByLabel("Constraints").fill("Do not replace the stable ID.");
    await page
      .getByRole("button", { name: "Commit selection", exact: true })
      .click();
    await expect(page.locator("#commit-status")).toContainText("Committed.");
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download committed selection" })
      .click();
    const download = await downloadPromise;
    const file = `${evidence}/${name}-selection.json`;
    await download.saveAs(file);
    const lock = execFileSync(
      "python3",
      ["scripts/retrieve.py", "lock", file],
      { encoding: "utf8" },
    );
    fs.writeFileSync(`${evidence}/${name}-lock.json`, lock);
    const fetched = JSON.parse(
      execFileSync(
        "python3",
        ["scripts/retrieve.py", "fetch", `${evidence}/${name}-lock.json`],
        { encoding: "utf8" },
      ),
    );
    expect(fetched.locked_ids).toEqual(["ex:chemistry-reaction-profile"]);
    expect(fetched.contexts[0].selection.aspect_notes).toContain("ΔH");
    await page.getByLabel("Aspect notes").fill("Changed");
    await expect(
      page.getByRole("button", { name: "Download committed selection" }),
    ).toBeDisabled();
    await page.getByRole("link", { name: "Atlas", exact: true }).click();
    await expect(page.locator(".topic-nav a")).toHaveCount(12);
    const topicLinks = await page
      .locator(".topic-nav a")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(topicLinks.length).toBe(12);
    for (const href of topicLinks) {
      await page.locator(`.topic-nav a[href="${href}"]`).click();
      await expect(page.locator(".card")).toHaveCount(4);
      await noOverflow();
    }
    await page.getByRole("link", { name: "Explore", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Follow your curiosity." }),
    ).toBeVisible();
    await page.getByLabel("Coverage", { exact: true }).selectOption("LIVE");
    await expect(page.locator(".card")).toHaveCount(6);
    await page.getByLabel("Medium", { exact: true }).selectOption("diagram");
    await expect(page.locator("#results")).toContainText("No examples");
    await page.getByLabel("Medium", { exact: true }).selectOption("");
    await page.getByLabel("Coverage", { exact: true }).selectOption("GAP");
    await expect(page.locator(".gap-preview")).toHaveCount(26);
    await page.screenshot({ path: `${evidence}/${name}-explore-gap.png` });
    await page
      .locator(".card")
      .filter({
        has: page.getByRole("heading", {
          name: "Born–Haber cycle · sodium chloride",
        }),
      })
      .click();
    await expect(page.locator(".detail-stage")).toContainText("GAP");
    await expect(
      page.getByRole("button", { name: "Add to selection" }),
    ).toBeDisabled();
    await noOverflow();
    await page.getByRole("link", { name: "Dictionary", exact: true }).click();
    await page.getByLabel("Find a concept").fill("reaction profile");
    await expect(page.locator(".dictionary-entry")).toHaveCount(1);
    await noOverflow();
    await page.screenshot({ path: `${evidence}/${name}-dictionary.png` });
    await page.getByRole("link", { name: "Index", exact: true }).click();
    await page.getByLabel("Search name or stable ID").fill("tool:d3");
    await expect(page.locator("#index-results tr")).toHaveCount(1);
    await noOverflow();
    await page.screenshot({ path: `${evidence}/${name}-index.png` });
    await page.getByRole("link", { name: "D3", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "D3", exact: true }),
    ).toBeVisible();
    for (const [id, expected] of [
      ["ideal-gas", "PV = 24.6"],
      ["hess-cycle", "-110.5"],
      ["gibbs-energy", "ΔG"],
      ["first-order", "mol L⁻¹"],
      ["titration-curve", "pH = 7.00"],
    ]) {
      await page.goto(`/#example/ex:chemistry-${id}`);
      await expect(page.locator("output")).toContainText(expected);
      await noOverflow();
      const before = await page.locator("output").textContent();
      await page.getByRole("slider").focus();
      await page.keyboard.press("End");
      await expect(page.locator("output")).not.toHaveText(before);
    }
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
          transferBytes: startup.reduce((s, r) => s + r.transferSize, 0),
          errors,
          failed,
          checks: [
            "12 topic inventories",
            "four primary views",
            "6 live model interactions",
            "explicit GAP",
            "collapsed AI/provenance",
            "no mobile overflow",
            "browser commit → CLI lock → package fetch",
            "identity and Unicode notes preserved",
          ],
        },
        null,
        2,
      ) + "\n",
    );
  });
  test(`${name}: lossless local provenance is text and web provenance remains linked`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const path = JSON.parse(fs.readFileSync("catalog/web-index.json", "utf8")).examples
      .find((e) => e.id === "ex:chemistry-reaction-profile").resolve_path;
    const resolved = JSON.parse(fs.readFileSync(path, "utf8"));
    const base = resolved.sources[0];
    resolved.sources.push(
      { ...base, id: "source:test-file", title: "Uploaded diagram", locator_type: "file", locator: "uploads/反应 profile.pdf" },
      { ...base, id: "source:test-image", title: "Local screenshot", locator_type: "image", locator: "screenshots/reaction.png" },
      { ...base, id: "source:test-prompt", title: "Original prompt", locator_type: "prompt", locator: "<img src=x onerror=alert(1)> Draw ΔH" },
    );
    await page.route(`**/${path}`, (route) => route.fulfill({ json: resolved }));
    await page.goto("/#example/ex:chemistry-reaction-profile");
    await page.locator("#provenance summary").click();
    const provenance = page.locator("#provenance");
    await expect(provenance).toContainText("uploads/反应 profile.pdf");
    await expect(provenance).toContainText("screenshots/reaction.png");
    await expect(provenance).toContainText("<img src=x onerror=alert(1)> Draw ΔH");
    await expect(provenance.locator("img")).toHaveCount(0);
    await expect(provenance.getByRole("link", { name: /Uploaded diagram|Local screenshot|Original prompt/ })).toHaveCount(0);
    const links = await provenance.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((url) => /^https?:\/\//.test(url))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${evidence}/${name}-provenance-fixture.png`, fullPage: true });
  });

}
