<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="title" /> &#183; RSS feed</title>
        <link rel="icon" href="/favicon.ico?v=2" sizes="32x32" />
        <meta name="robots" content="noindex" />
        <style>
          :root {
            color-scheme: light dark;
            --paper: light-dark(#fbf8f4, #141317);
            --surface: light-dark(#ffffff, #1d1c21);
            --ink: light-dark(#1c1a20, #eeebe7);
            --ink-2: light-dark(#48444f, #bdb8c2);
            --ink-3: light-dark(#6b6672, #95909b);
            --line: light-dark(#e8e2db, #2f2d35);
            --brand-text: light-dark(#b8305a, #ff8fa8);
            --brand-tint: light-dark(#fde8ee, #3a1e27);
            --v-false-fg: light-dark(#b42318, #fda29b);
            --v-false-bg: light-dark(#fee4e2, #3d1714);
            --v-misleading-fg: light-dark(#93370d, #fec84b);
            --v-misleading-bg: light-dark(#fef0c7, #3a2a0b);
            --v-mixed-fg: light-dark(#5925dc, #bdb4fe);
            --v-mixed-bg: light-dark(#ebe9fe, #231b45);
            --v-true-fg: light-dark(#067647, #75e0a7);
            --v-true-bg: light-dark(#dcfae6, #0e2e1f);
            --sans: "Montserrat", system-ui, sans-serif;
            --serif: "Source Serif 4", Georgia, serif;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0 auto;
            padding: clamp(1.5rem, 1rem + 2.5vw, 3rem) clamp(1rem, 0.5rem + 2.5vw, 2rem) 4rem;
            max-width: 46rem;
            background: var(--paper);
            color: var(--ink);
            font-family: var(--serif);
            font-size: 1.0625rem;
            line-height: 1.7;
            -webkit-text-size-adjust: 100%;
          }
          h1, h2, h3 {
            margin: 0;
            font-family: var(--sans);
            letter-spacing: -0.02em;
            line-height: 1.2;
            text-wrap: balance;
          }
          h1 { font-size: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem); font-weight: 800; }
          a { color: var(--brand-text); text-decoration-thickness: 1px; text-underline-offset: 2px; }
          .banner {
            margin-bottom: 2.5rem;
            padding: 1.25rem 1.5rem;
            border: 1px solid var(--line);
            border-radius: 12px;
            background: var(--surface);
            font-family: var(--sans);
            font-size: 0.9375rem;
            line-height: 1.6;
          }
          .banner p { margin: 0 0 0.75rem; color: var(--ink-2); }
          .banner p:last-child { margin-bottom: 0; }
          .banner strong { color: var(--ink); }
          .url {
            display: block;
            padding: 0.6rem 0.8rem;
            border-radius: 8px;
            background: var(--brand-tint);
            color: var(--ink);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.875rem;
            word-break: break-all;
          }
          .lede { margin: 0.75rem 0 0; color: var(--ink-2); font-size: 1.125rem; }
          .count {
            margin: 2.5rem 0 1rem;
            font-family: var(--sans);
            font-size: 0.8125rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--ink-3);
          }
          ol { margin: 0; padding: 0; list-style: none; }
          li { padding: 1.5rem 0; border-top: 1px solid var(--line); }
          li h2 { font-size: 1.25rem; font-weight: 700; }
          li h2 a { color: var(--ink); text-decoration-color: color-mix(in srgb, var(--brand-text) 45%, transparent); }
          li h2 a:hover { color: var(--brand-text); }
          .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.6rem; }
          .badge {
            padding: 0.15rem 0.5rem;
            border-radius: 999px;
            font-family: var(--sans);
            font-size: 0.75rem;
            font-weight: 700;
          }
          .badge.false { background: var(--v-false-bg); color: var(--v-false-fg); }
          .badge.misleading { background: var(--v-misleading-bg); color: var(--v-misleading-fg); }
          .badge.mixed { background: var(--v-mixed-bg); color: var(--v-mixed-fg); }
          .badge.true { background: var(--v-true-bg); color: var(--v-true-fg); }
          .date, .tag { font-family: var(--sans); font-size: 0.8125rem; color: var(--ink-3); }
          .tag::before { content: "\00B7"; margin-right: 0.5rem; }
          .summary { margin: 0.6rem 0 0; color: var(--ink-2); }
        </style>
      </head>
      <body>
        <div class="banner">
          <p><strong>This is an RSS feed.</strong> Paste the address below into a feed reader to get new fact-checks as they are published.</p>
          <code class="url"><xsl:value-of select="link" />rss.xml</code>
          <p style="margin-top:0.75rem">Looking for the site? <a href="{link}">Go to <xsl:value-of select="link" /></a></p>
        </div>

        <h1><xsl:value-of select="title" /></h1>
        <p class="lede"><xsl:value-of select="description" /></p>

        <p class="count"><xsl:value-of select="count(item)" /> fact-checks</p>
        <ol>
          <xsl:apply-templates select="item" />
        </ol>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="item">
    <xsl:variable name="verdict" select="substring-before(substring-after(description, 'Verdict: '), '.')" />
    <li>
      <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
      <div class="meta">
        <xsl:if test="$verdict">
          <span class="badge {translate($verdict, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')}"><xsl:value-of select="$verdict" /></span>
        </xsl:if>
        <span class="date"><xsl:value-of select="substring(pubDate, 6, 11)" /></span>
        <xsl:for-each select="category">
          <span class="tag"><xsl:value-of select="." /></span>
        </xsl:for-each>
      </div>
      <p class="summary">
        <xsl:choose>
          <xsl:when test="$verdict">
            <xsl:value-of select="substring-after(description, concat('Verdict: ', $verdict, '. '))" />
          </xsl:when>
          <xsl:otherwise><xsl:value-of select="description" /></xsl:otherwise>
        </xsl:choose>
      </p>
    </li>
  </xsl:template>
</xsl:stylesheet>
