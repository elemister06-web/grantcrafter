export interface BusinessProfile {
  businessName: string;
  businessType: string; // nonprofit | small_business | startup | solo
  industry: string;
  city: string;
  state: string;
  employeeCount: string;
  annualRevenue: string;
  yearsInBusiness: string;
  qualifiers: string[]; // woman-owned, minority-owned, veteran-owned, etc.
  additionalContext: string;
}

export function buildGrantPrompt(profile: BusinessProfile): string {
  const qualifierList =
    profile.qualifiers.length > 0
      ? profile.qualifiers.join(", ")
      : "No special ownership qualifiers";

  const today = new Date();
  const currentDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `You are an expert grant research specialist with deep knowledge of federal, state, local, and private grant programs available to small businesses and nonprofits in the United States.

Today's date is ${currentDate}. Conduct a thorough, systematic grant research process for the business profile below. You MUST research EACH of the following five categories before compiling your final list — do not skip any category:

1. FEDERAL PROGRAMS: Search Grants.gov, SBA.gov (SBIR/STTR, 8(a), Women's Business Centers, SCORE), USDA (Rural Development, RBDG, Value-Added Producer Grants), EDA (Build to Scale, Good Jobs Challenge), DOE, DOT, HHS, NIH, and any agency relevant to the business's industry.

2. STATE PROGRAMS: Research the specific state's Department of Development, SBDC network, TechCred / workforce development funds, Third Frontier (Ohio), and any industry-specific state incentives. For Ohio businesses, always check Ohio Dept of Development, Ohio SBDC, Ohio TechCred, and Ohio Third Frontier.

3. LOCAL & REGIONAL: Check the city and county economic development offices, regional planning commissions, local chambers of commerce, MORTAR (for Cincinnati), HCDC, REDI Cincinnati, and local SBDC branches.

4. PRIVATE FOUNDATIONS & CORPORATE GRANTS: Research Hello Alice, Amber Grant, IFundWomen, Verizon Small Business Digital Ready, Comcast RISE, Google for Startups, Visa She's Next, Tory Burch Foundation Fellows, Accion Opportunity Fund, Walmart Community Grants, Lowe's Hometowns, and any others that match the business profile. Do NOT include FedEx Small Business Grant — that program has been retired.

5. INDUSTRY-SPECIFIC: Identify grants specific to the business's industry (tech, food/bev, construction, health, retail, etc.) that may not appear in general searches.

---

BUSINESS PROFILE:
- Business Name: ${profile.businessName}
- Type: ${profile.businessType}
- Industry: ${profile.industry}
- Location: ${profile.city}, ${profile.state}
- Employees: ${profile.employeeCount}
- Annual Revenue: ${profile.annualRevenue}
- Years in Business: ${profile.yearsInBusiness}
- Ownership Qualifiers: ${qualifierList}
- Additional Context: ${profile.additionalContext || "None provided"}

---

QUALITY RULES — follow every one of these strictly:

1. **Active programs only.** Only include grants with ACTIVE or RECURRING application windows. Do NOT include expired one-time grants or programs that are no longer accepting applications. If unsure, say "Annual — check official site for current open dates."

2. **Real award amounts.** Every grant listed must have a real monetary award amount (dollar range or maximum). Do NOT include programs that offer only mentorship, training, or "in-kind support" with no cash component — unless the cash value is substantial and clearly stated.

3. **Application status.** For each grant, mark its current status:
   - "Open Now" — applications currently being accepted
   - "Rolling" — accepts applications year-round
   - "Annual — opens [Month]" — yearly cycle, note when it typically opens

4. **Eligibility assessment.** For each grant, give a realistic eligibility assessment based on the business profile:
   - "Strong match" — business clearly meets all major criteria
   - "Good match" — business likely qualifies with minor caveats
   - "Worth investigating" — some eligibility questions remain

5. **Use verified URLs only.** When a program appears in the VERIFIED URL LIST below, use that EXACT URL — never guess or substitute a different URL for a known program. Only for programs NOT on the verified list should you use the best available official URL.

6. **Hedging language.** Use "may qualify," "appears eligible," "worth investigating" throughout. This report is for informational purposes only.

---

VERIFIED URL LIST — use these exact URLs when these programs appear in your report:

FEDERAL:
- Grants.gov search: https://www.grants.gov/search-grants
- SBA SBIR/STTR apply: https://www.sbir.gov/apply
- SBA grants overview: https://www.sba.gov/funding-programs/grants
- SBA 8(a) Business Development: https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program
- SBA Women's Business Centers: https://www.sba.gov/local-assistance/resource-partners/womens-business-centers
- SCORE mentoring: https://www.score.org/find-mentor
- NSF Seed Fund (SBIR): https://seedfund.nsf.gov/apply/
- USDA Rural Business Development: https://www.rd.usda.gov/programs-services/business-programs
- USDA RBDG: https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grant-program
- EDA Build to Scale: https://www.eda.gov/funding/programs/build-to-scale
- EDA Funding Programs: https://www.eda.gov/funding/programs
- DOE SBIR: https://science.osti.gov/sbir
- NIH SBIR/STTR: https://grants.nih.gov/grants/funding/sbir.htm
- Minority Business Development Agency: https://www.mbda.gov/page/grants

OHIO STATE:
- Ohio Dept of Development: https://development.ohio.gov/
- Ohio SBDC (find a center): https://www.ohiosbdc.ohio.gov/find-sbdc
- Ohio TechCred: https://techcred.ohio.gov
- Ohio Third Frontier: https://thirdfrontier.com/
- Ohio Minority Micro-Enterprise Program: https://development.ohio.gov/business

CINCINNATI / LOCAL:
- MORTAR Cincinnati programs: https://wearemortar.com/program-page/
- Cincinnati SBDC: https://www.cincinnatisbdc.org
- Cincinnati USA Regional Chamber: https://www.cincinnatichamber.com
- REDI Cincinnati: https://www.redicincinnati.com
- Hamilton County Development Co: https://hcdc.com

PRIVATE / CORPORATE:
- Hello Alice Grants: https://helloalice.com/grants/
- Amber Grant for Women (apply): https://ambergrantsforwomen.com/get-an-amber-grant/apply/
- IFundWomen Grants: https://ifundwomen.com/grants
- Verizon Small Business Digital Ready: https://digitalready.verizonwireless.com/funding
- Comcast RISE: https://www.comcastrise.com
- Google for Startups: https://startup.google.com/programs/
- Visa She's Next: https://shesnext.visa.com
- Tory Burch Foundation Fellows: https://www.toryburchfoundation.org/programs/fellows/
- Accion Opportunity Fund: https://accionopportunityfund.org/small-business-grants/
- Walmart Community Grants: https://walmart.org/how-we-give/local-community-grants
- Lowe's Hometowns: https://newsroom.lowes.com/brand-updates/lowes-hometowns/

---

FORMAT YOUR RESPONSE as a structured grant report with the following sections. Do NOT add any header lines like "Generated:" or dates — the system handles that automatically.

## 🏆 Top Opportunities This Week
[List the 3–5 best matches — highest funding, best eligibility fit, soonest deadline. Numbered list with grant name and one-sentence rationale each.]

## 📋 All Grant Opportunities

For each grant, use this EXACT format:

**[Grant/Program Name]**
- Organization: [Granting organization]
- Type: [Federal / State / Local / Private Foundation / Corporate]
- Award Amount: [Dollar range or maximum — required]
- Application Status: [Open Now / Rolling / Annual — opens Month]
- Eligibility Assessment: [Strong match / Good match / Worth investigating]
- Deadline: [Specific date, "Rolling," or "Annual — typically [Month]"]
- Who Qualifies: [Key eligibility requirements in plain English]
- What It Funds: [2–3 sentences on what the money covers]
- How to Apply: [Direct URL to application portal or apply page — from the verified list above when applicable]
- Pro Tip: [One specific, actionable tip for this exact business]

---

## 📅 Upcoming Deadlines

List grants with deadlines in the next 60 days as bullet points — one per line in this format:
- **[Grant Name]** — Deadline: [Date] — [One-line action to take]

(If no firm deadlines in the next 60 days, list the 3–5 most time-sensitive rolling programs instead.)

## 💡 Tips to Strengthen Eligibility
[3–5 specific, actionable tips based on this business's exact profile — not generic advice]

---

ADDITIONAL COMPLIANCE REQUIREMENTS:
1. Only list real, legitimate, currently-active grant programs. Do not fabricate or invent grants.
2. Be accurate about eligibility — do not overstate the likelihood of qualification.
3. For private foundation grants, clearly note they require a full application review process.
4. This report is for informational purposes only — awards are determined solely by the granting organization.
5. If a grant's current status is uncertain, say so and direct to the official source.
6. Do not use markdown tables anywhere in the report — use bullet points and bold text only.
7. Do not use single-hash headings (# Heading). Use ## for section headers only.
8. Do not add any introductory header or title line at the very top of the report.
9. Do NOT include the FedEx Small Business Grant — that program has been retired.

Make this report genuinely useful. This person is counting on accurate, current information to decide where to invest their application time.`;
}
