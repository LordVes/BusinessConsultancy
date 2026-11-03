// English version of whitepaper #1. Mirrors scripts/whitepaper.mjs one-to-one:
// same ids, same source numbers, same figures (written with decimal points).
// Shown only when the visitor switches the page to EN.

export const WP_EN = {
  title: "Digital maturity of Bulgarian export-oriented mid-sized companies",
  shortTitle: "Digital maturity of mid-sized exporters",
  subtitle: "Where we stand today, which tools help with the transition, and where requirements are heading",
  org: "MSP Compass",
  dateEn: "3 November 2026",
  version: "1.0",
  readingTime: "25 minutes",
};

export const SOURCES_EN = {
  1: "Eurostat, Digital Intensity by size class of enterprise (isoc_e_dii), updated 27.02.2026",
  2: "Eurostat, Artificial intelligence by size class of enterprise (isoc_eb_ai), updated 15.06.2026",
  3: "Eurostat, Cloud computing services by size class of enterprise (isoc_cicce_use)",
  4: "Eurostat, E-commerce sales of enterprises by size class of enterprise (isoc_ec_esels), updated 15.06.2026",
  5: "Eurostat, Integration of internal processes by size class of enterprise (isoc_eb_iip), updated 27.02.2026",
  6: "Eurostat, Data analytics by size class of enterprise (isoc_eb_das), updated 27.02.2026",
  7: "Eurostat, Enterprises that employ ICT specialists by size class of enterprise (isoc_ske_itspe), updated 15.06.2026",
  8: "Eurostat, Trade by NACE Rev. 2 activity and enterprise size class (ext_tec01), updated 08.10.2026",
  9: "European Commission, Digital Decade 2026 country report: Bulgaria, SWD(2026) 155, 17.06.2026 (Council document 10476/26 ADD 32)",
  10: "Eurostat, Information note: comparability of data on DII version 3, 11.12.2025",
  11: "Bulgarian National Statistical Institute (NSI), methodological metadata \"ICT usage and e-commerce in enterprises\" (coverage: enterprises with 10 or more persons employed)",
  12: "IMDA and BCG, Digital Acceleration Index: Fact Sheet, 16.10.2019",
  13: "MIT Sloan Management Review and Deloitte, Achieving Digital Maturity, 2017",
  14: "Deloitte Germany, Digital Maturity Index 2025, 20.03.2025",
  15: "KPMG Switzerland, Digital Readiness Assessment, April 2016",
  16: "Bain & Company, Digital Maturity Assessment (service page, undated)",
  17: "EY, EY Assess: maturity assessment platform (service page, undated)",
  18: "European Commission, EDIH network, DMA Framework Guidelines for EDIHs, November 2023",
  19: "Bulgarian Ministry of Innovation and Growth, PCIE 2021–2027, \"Digitalisation of Enterprises\": selection methodology and criteria, April 2025 (in Bulgarian)",
  20: "ISUN 2020, open calls under EU-funded programmes in Bulgaria (in Bulgarian)",
  21: "European Commission, catalogue of European Digital Innovation Hubs (EDIH)",
};

export const INDICATORS_EN = [
  { name: "At least a basic level of digital intensity (DII version 3), 10–249 employees", bg: "38.3", eu: "71.4", year: "2025", src: [1, 9] },
  { name: "At least a basic level of digital intensity (DII version 3), 50–249 employees", bg: "55.4", eu: "86.7", year: "2025", src: [1] },
  { name: "Use an ERP system", bg: "41.9", eu: "69.9", year: "2025", src: [5] },
  { name: "Use a CRM system", bg: "16.8", eu: "43.8", year: "2025", src: [5] },
  { name: "Use business intelligence (BI) software", bg: "12.3", eu: "34.3", year: "2025", src: [5] },
  { name: "Buy cloud computing services", bg: "30.1", eu: "66.8", year: "2025", src: [3] },
  { name: "Analyse data (from any source)", bg: "33.7", eu: "52.0", year: "2025", src: [6] },
  { name: "Use at least one artificial intelligence technology", bg: "13.3", eu: "30.4", year: "2025", src: [2] },
  { name: "Sell through e-commerce (web or EDI)", bg: "19.0", eu: "31.7", year: "2025", src: [4] },
  { name: "Make web sales to customers in other EU countries", bg: "6.2", eu: "11.2", year: "2025", src: [4] },
  { name: "Employ ICT specialists", bg: "31.5", eu: "43.0", year: "2024", src: [7] },
  { name: "Apply at least 5 of 11 cybersecurity measures (all enterprises with 10+ employees)", bg: "31.3", eu: "56.9", year: "2024", src: [9] },
];

export const FRAMEWORKS_EN = [
  {
    name: "Digital Acceleration Index (DAI)",
    by: "BCG; as described by IMDA (Singapore), 2019",
    dims: "6 building blocks: business strategy driven by digital; digitising the core; new digital growth; changing ways of working; data and technology; integrating ecosystems",
    scale: "4 stages: Digital Starter, Digital Literate, Digital Performer, Digital Leader",
    criteria: "Not stated in the source",
    evidence: "Over 2,000 companies in the first DAI in Singapore, 2019",
    limits: "The methodology is not public. BCG's own page could not be opened, so we rely on the description by IMDA, BCG's partner in developing it.",
    src: [12],
  },
  {
    name: "Achieving Digital Maturity",
    by: "MIT Sloan Management Review and Deloitte, 2017",
    dims: "No formal dimensions; describes five practices of more mature companies",
    scale: "Self-rating 1–10 against an \"ideal\" organisation: early (1–3), developing (4–6), maturing (7–10)",
    criteria: "One maturity question plus thematic questions",
    evidence: "Over 3,500 managers from 117 countries and 29 industries, autumn 2016; 15 interviews",
    limits: "A subjective overall rating. Good for starting a conversation, not for diagnosing processes.",
    src: [13],
  },
  {
    name: "Digital Maturity Index (DMI)",
    by: "Deloitte Germany and the University of Duisburg-Essen; 2025 edition (first survey 2019)",
    dims: "4 indices: strategic (Digital Business, Dynamic Capability) and operational (Digital Activity, Digital Capability)",
    scale: "6 archetypes: Laggards, Followers, Operators, Innovators, Potentials, Champions",
    criteria: "More than 90 parameters",
    evidence: "593 company leaders (386 from Germany) in manufacturing-heavy sectors",
    limits: "Built for large manufacturers; 90 parameters are a lot for a 60-person firm. The 2023 edition was not accessible, so we cite the 2025 edition.",
    src: [14],
  },
  {
    name: "Digital Readiness Assessment (DRA)",
    by: "KPMG Switzerland, 2016",
    dims: "Areas: development and purchasing, production, marketing, sales. Two perspectives: management (transformation intensity) and pervasiveness (operational effectiveness)",
    scale: "4 levels: reactive participant, digital operator, ambitious transformer, smart digitalist",
    criteria: "Not published",
    evidence: "Questionnaire with percentile results, weighted by industry",
    limits: "A short 2016 description; the full criteria are not public. The idea of two perspectives is useful and we borrow it.",
    src: [15],
  },
  {
    name: "Digital Maturity Assessment (DMA)",
    by: "Bain & Company, page undated",
    dims: "5 dimensions: digital strategy; industry-specific use cases; tech and data foundations; operating model and talent; results delivery",
    scale: "Not published",
    criteria: "Not published",
    evidence: "Database of nearly 1,200 companies",
    limits: "A commercial product; the comparison is with much larger companies.",
    src: [16],
  },
  {
    name: "EY Assess",
    by: "EY, page undated",
    dims: "Domains: transformation, finance, cybersecurity, technology, supply chain, risk",
    scale: "Configurable questionnaires",
    criteria: "Not published",
    evidence: "EY's own benchmarking data",
    limits: "An assessment platform, not a public framework; no public list of criteria.",
    src: [17],
  },
];

export const PUBLIC_TOOL_EN = {
  name: "Digital Maturity Assessment (DMA) of the EDIH network",
  by: "European Commission, guidelines of November 2023",
  dims: "6 dimensions: digital business strategy; digital readiness; human-centric digitalisation; data management; automation and intelligence; green digitalisation",
  scale: "Each dimension scored from 0 to 100",
  criteria: "11 questions with several options each",
  evidence: "Used by European Digital Innovation Hubs (EDIH) before and after their support",
  limits: "Comparable across the EU, but broad: it has no level definitions for processes such as order-to-cash.",
  src: [18],
};

export const LEVELS_EN = [
  { n: 1, name: "Manual and ad hoc", text: "Work depends on people, paper and separate files. Results are hard to repeat." },
  { n: 2, name: "Digitised in islands", text: "Systems exist, but in separate units. Data is moved between them by hand." },
  { n: 3, name: "Integrated across functions", text: "The process runs through connected systems without re-keying. Responsibilities are clear." },
  { n: 4, name: "Data-driven and continuously improved", text: "Decisions are made on data from the systems, and the process is measured and improved regularly." },
];

export const LENSES_EN = {
  manage: {
    name: "Management",
    q: "How deliberately is the dimension managed?",
    levels: [
      "Nobody is responsible for it.",
      "There is an owner, but no targets or budget.",
      "There is an owner, targets and budget; progress is reviewed regularly.",
      "Managed with indicators and adjusted at least quarterly.",
    ],
  },
  use: {
    name: "Pervasiveness",
    q: "How widely is it used day to day?",
    levels: [
      "Only individual people.",
      "One department or one site.",
      "Most of the departments concerned.",
      "Everywhere, including with customers and suppliers.",
    ],
  },
};

export const DIMENSIONS_EN = [
  {
    id: "strategy", name: "Strategy and leadership",
    question: "Are digital projects tied to specific business decisions and to the requirements of key customers?",
    data: "No direct national indicator.",
    criteria: [
      { id: "s1", name: "Digital goals tied to a business decision", levels: [
        "No written digitalisation goals; projects start on individual initiative.",
        "A list of projects by department, not linked to business goals.",
        "3–5 digital goals are derived from the business strategy, each with an owner and a deadline.",
        "Goals are reviewed at least quarterly against measured results and adjusted.",
      ] },
      { id: "s2", name: "Leadership involvement", levels: [
        "Digitalisation is \"IT's job\" or an outside firm's.",
        "The owner approves purchases but does not follow up on delivery.",
        "A member of management owns the digital roadmap and reports on it regularly.",
        "Management decides on data from the systems, not on one-off Excel reports.",
      ] },
      { id: "s3", name: "Roadmap and priorities", levels: [
        "No plan; purchases react to a problem or an offer.",
        "A plan for the next purchase, but no sequence of steps.",
        "A 12-month roadmap with priorities, dependencies and budget.",
        "The roadmap is updated at least yearly against results and market changes.",
      ] },
      { id: "s4", name: "Key customer requirements", levels: [
        "We do not know what digital requirements our foreign customers have.",
        "We react when a customer sets a requirement.",
        "Key customers' requirements (formats, portals, security) are documented and built into the plan.",
        "We anticipate requirements and use them as an advantage in negotiations.",
      ] },
    ],
  },
  {
    id: "customers", name: "Customers and markets",
    question: "Do we see our customers, quotes and channels in one place?",
    data: "CRM: 16.8% vs 43.8% in the EU; e-commerce: 19.0% vs 31.7% (50–249 employees, 2025).",
    src: [5, 4],
    criteria: [
      { id: "c1", name: "Customer data", levels: [
        "Contacts and history live in emails and salespeople's personal notes.",
        "There is a CRM or shared spreadsheet, but it is filled in patchily.",
        "All salespeople work in one CRM linked to quotes and orders.",
        "CRM data is used to forecast sales and prioritise customers.",
      ] },
      { id: "c2", name: "Quotes and pricing", levels: [
        "Every quote is built by hand in Word or Excel.",
        "Templates exist, but prices and stock are checked by hand.",
        "Quotes are generated by a system with current prices, stock and lead times.",
        "The margin per quote is visible upfront, and win/loss is analysed.",
      ] },
      { id: "c3", name: "Digital channels to foreign customers", levels: [
        "Communication is by email and phone only.",
        "There is a website and catalogue, but no electronic ordering.",
        "Key customers order or track orders electronically (portal, EDI or B2B shop).",
        "Digital channels carry a measurable share of sales and are developed using customer behaviour data.",
      ] },
      { id: "c4", name: "Complaints and feedback", levels: [
        "Complaints are kept on paper or in emails.",
        "Complaints are logged in a spreadsheet, with no root-cause analysis.",
        "Complaints are logged in a system linked to the order and batch.",
        "Root causes are analysed regularly and lead to product or process changes.",
      ] },
    ],
  },
  {
    id: "o2c", name: "Order-to-cash and supply chain",
    question: "Does an export order move from enquiry to payment without re-keying?",
    data: "ERP: 41.9% vs 69.9% in the EU (50–249 employees, 2025).",
    src: [5],
    criteria: [
      { id: "o1", name: "Order processing", levels: [
        "Orders are keyed in by hand from email or PDF, often more than once.",
        "The order is entered once in the ERP, but confirmations and documents are made by hand.",
        "The order runs from intake to invoice in one system without re-keying.",
        "Time and errors in the order-to-cash cycle are measured and deliberately reduced.",
      ] },
      { id: "o2", name: "Export documents and invoicing", levels: [
        "Invoices, CMRs and accompanying documents are prepared by hand in Excel or Word.",
        "Invoices come from the system, but export documents are made separately.",
        "Invoices and export documents are generated by one system and sent electronically.",
        "Documents are exchanged electronically with customers, forwarders and banks, with automatic checks.",
      ] },
      { id: "o3", name: "Purchasing and inventory", levels: [
        "Supplier orders are placed from experience and stock checked by eye.",
        "Stock is kept in a system, but planning is done in Excel.",
        "Material needs are calculated by the system from orders and the production plan.",
        "Stock and supplier lead times are optimised with data and scenarios.",
      ] },
      { id: "o4", name: "Shipment tracking", levels: [
        "Shipment status comes from a phone call to the forwarder.",
        "Status is checked separately on each forwarder's portal.",
        "Shipment status is visible in our own system and shared with the customer.",
        "Delays are predicted and the customer is notified automatically.",
      ] },
    ],
  },
  {
    id: "ops", name: "Production and operations",
    question: "Do we know within the shift what was produced, scrapped and stopped?",
    data: "No current national indicator for production data.",
    criteria: [
      { id: "p1", name: "Production planning", levels: [
        "The plan is on a whiteboard or in the shift supervisor's head.",
        "The plan is in Excel and updated by hand.",
        "The plan is made in a system linked to orders and stock.",
        "The plan recalculates on change and shows the effect on customer due dates.",
      ] },
      { id: "p2", name: "Production reporting", levels: [
        "Output is recorded on paper at the end of the shift.",
        "Data is entered by hand into a spreadsheet or system after the shift.",
        "Quantity, scrap and downtime are recorded at the workstation as they happen.",
        "Machine data flows in automatically and is used to analyse effectiveness (for example OEE).",
      ] },
      { id: "p3", name: "Quality and batch traceability", levels: [
        "Quality is checked visually; records are on paper.",
        "Inspection results are in spreadsheets, not linked to the batch.",
        "Every batch can be traced in the system from raw material to customer.",
        "Quality data is analysed statistically to prevent defects.",
      ] },
      { id: "p4", name: "Equipment maintenance", levels: [
        "We repair things when they break.",
        "There is a preventive maintenance schedule in a spreadsheet.",
        "Maintenance is planned and logged in a system with history per machine.",
        "Maintenance is planned from machine condition data.",
      ] },
    ],
  },
  {
    id: "data", name: "Data and technology foundation",
    question: "Is there one source of truth for items, customers and prices?",
    data: "Cloud services: 30.1% vs 66.8%; data analytics: 33.7% vs 52.0%; artificial intelligence: 13.3% vs 30.4% (50–249 employees, 2025).",
    src: [3, 6, 2],
    criteria: [
      { id: "d1", name: "Master data", levels: [
        "Items, customers and suppliers are repeated across files with different codes.",
        "There is a master register in the ERP, but with duplicates and incomplete fields.",
        "There is one source of master data and rules for who creates and maintains it.",
        "Master data quality is measured and has an owner with time set aside for it.",
      ] },
      { id: "d2", name: "System integration", levels: [
        "Systems are not connected; data is moved by hand.",
        "Data is transferred by exporting and importing files.",
        "Core systems (ERP, CRM, warehouse, production) exchange data automatically.",
        "New applications connect in a standard way (API), with no manual steps.",
      ] },
      { id: "d3", name: "Reporting and analysis", levels: [
        "Reports are built by hand in Excel when needed.",
        "Standard reports exist, but figures differ between departments.",
        "Key indicators are visible on a shared dashboard from one data source.",
        "Data analysis, including forecasts, is part of routine decisions.",
      ] },
      { id: "d4", name: "Infrastructure and cloud", levels: [
        "A server in the office, with no clear support or backups.",
        "Some services are in the cloud, with no overall policy.",
        "It is clear what runs in the cloud and what on-premises, with contracted support and backups.",
        "Infrastructure is monitored and scaled, and costs are tracked per service.",
      ] },
    ],
  },
  {
    id: "people", name: "People and organisation",
    question: "Does every core process have an owner, and is there time for the change?",
    data: "Employ ICT specialists: 31.5% vs 43.0% (50–249 employees, 2024). In a 2025 survey by the Bulgarian Industrial Association, 40% of firms named a lack of digital skills as the main obstacle.",
    src: [7, 9],
    criteria: [
      { id: "h1", name: "Digital skills", levels: [
        "Skills depend on individuals; there is no training.",
        "Training happens only when a new system is introduced.",
        "There is a skills plan by role and regular training.",
        "Skills are assessed, and key users train their colleagues.",
      ] },
      { id: "h2", name: "Ownership of processes and data", levels: [
        "Nobody owns a process end to end.",
        "Responsibility sits with departments; problems between departments have no owner.",
        "Every core process and every master data set has a named owner.",
        "Owners manage their processes with indicators and initiate improvements themselves.",
      ] },
      { id: "h3", name: "Capacity for change", levels: [
        "No one inside the firm can lead digital projects.",
        "Projects are led by the software vendor.",
        "There is an internal project lead or IT owner with time set aside.",
        "A team leads changes consistently and measures the effect.",
      ] },
    ],
  },
  {
    id: "risk", name: "Risk, security and compliance",
    question: "Can we show a customer or auditor evidence of our security measures?",
    data: "At least 5 of 11 cybersecurity measures: 31.3% vs 56.9% in the EU, the lowest share in the EU (all enterprises with 10+ employees, 2024).",
    src: [9],
    criteria: [
      { id: "r1", name: "Basic cybersecurity measures", levels: [
        "Antivirus and passwords, nothing more.",
        "Some measures are in place (for example backups), but not systematically.",
        "Multi-factor authentication, regular backups, updates and staff training are in place.",
        "Measures are tested regularly, for example with a penetration test and a restore test.",
      ] },
      { id: "r2", name: "Customer and regulatory requirements", levels: [
        "We do not know whether NIS2 or our customers' requirements apply to us.",
        "We answer security questionnaires when they arrive, without evidence.",
        "We have documented policies and evidence we can show a customer or auditor.",
        "Security is part of risk management and is reported to management.",
      ] },
      { id: "r3", name: "Business continuity", levels: [
        "There is no plan for what to do if systems stop.",
        "We know which systems are critical, but the plan is untested.",
        "A recovery plan with time and data-loss targets, tested at least yearly.",
        "The plan is improved after every incident or test.",
      ] },
      { id: "r4", name: "Access and personal data", levels: [
        "Access is shared; accounts of people who have left stay active.",
        "Access is granted on request, with no periodic review.",
        "Rights are role-based and reviewed periodically; personal data processing is documented.",
        "Access is monitored and unusual activity is detected automatically.",
      ] },
    ],
  },
  {
    id: "value", name: "Value and investment",
    question: "Do we know what each digital investment delivers?",
    data: "According to the European Commission, support measures have not yet led to large-scale change, and investment in intangible assets is lower.",
    src: [9],
    criteria: [
      { id: "v1", name: "Business case", levels: [
        "Purchases are made without assessing the benefit.",
        "The cost is assessed, but not the expected benefit.",
        "Every project has an expected benefit in money or time and an indicator to check it.",
        "Benefits are measured after go-live and shape the next decisions.",
      ] },
      { id: "v2", name: "Budget and funding", levels: [
        "No budget; we spend as needed.",
        "There is an annual IT budget, mostly for maintenance.",
        "There is a development budget tied to the roadmap, including a check for funding programmes.",
        "Investments are managed as a portfolio with priorities and periodic review.",
      ] },
      { id: "v3", name: "Use of what has been implemented", levels: [
        "Implemented systems are partly used or bypassed with Excel.",
        "We know which modules are unused, but nothing changes.",
        "Use of key functions is tracked and the reasons for workarounds are removed.",
        "Benefits are reported regularly and unused licences are cancelled.",
      ] },
    ],
  },
];

export const PRINCIPLES_WP_EN = [
  { name: "Start from the management decision", text: "The assessment answers a specific question: for example, which investment to make first, or what the next large customer will ask for. Without such a question, nobody owns the result." },
  { name: "Report a profile, not one number", text: "An average hides the bottleneck. Show the level for each dimension and its weakest criterion." },
  { name: "Targets follow strategy", text: "Not every dimension needs to reach level 4. For most dimensions, level 3 is the realistic target; a higher level makes sense where it is a source of advantage." },
  { name: "End with a roadmap", text: "The assessment ends with a 90-day plan and a 12-month roadmap with owners, not with a heat map." },
];

export const PROCESS_EN = [
  { name: "Decision and scope", when: "Week 1", text: "State the management decision the assessment will support. Define the scope (sites, product lines, markets), the sponsor in management and the target level for each dimension." },
  { name: "Evidence", when: "Weeks 1–3", text: "6–8 interviews with managers and key users; an inventory of the systems and files in use; 2–3 on-site process walk-throughs, for example one export order from enquiry to payment; about 15 hard data points, such as the share of orders keyed in by hand, time from order to invoice, number of duplicates in master data, scrap, and days to payment." },
  { name: "Scoring and calibration", when: "Week 4", text: "Two people score each criterion independently from the evidence. Differences are resolved in a workshop with management: every score must have evidence behind it." },
  { name: "Priorities and plan", when: "Weeks 5–6", text: "Gaps against the targets are ranked by their effect on the management decision. The result is a 90-day plan and a 12-month roadmap." },
];

export const PITFALLS_EN = [
  { name: "Scoring without a decision", text: "The assessment is done \"to know where we stand\", and then nobody acts on it." },
  { name: "Vague level definitions", text: "Levels such as \"partly\" or \"good\" give different scores from different people. Each level must describe something you can see." },
  { name: "An average that hides the bottleneck", text: "An average of 2.6 can hide a level 1 in master data that holds everything else back." },
  { name: "Rewarding apps instead of data and ownership", text: "The number of systems installed is not maturity. Without an owner and clean data, a new system becomes one more island." },
  { name: "Stopping at the heat map", text: "The coloured map is an interim result. The value lies in choosing which 2–3 things to change first and who leads them." },
];

export const HYPOTHESES_EN = [
  {
    name: "Most firms have an ERP, but master data is weak and the export interface runs on Excel.",
    context: "Eurostat data puts the first part in doubt: only 41.9% of Bulgarian firms with 50–249 employees report using an ERP (2025). The hypothesis may hold for exporters but not for the average firm.",
    src: [5],
    test: "A systems inventory and a walk-through of one export order: the number of manual hand-offs and of files outside the ERP.",
  },
  {
    name: "The binding constraint is people and ownership, not technology spend.",
    context: "In a 2025 survey of 847 firms by the Bulgarian Industrial Association, 40% named a lack of digital skills as the main obstacle, and 33% named financial constraints.",
    src: [9],
    test: "Scores on the people and ownership criteria compared with the technology criteria; a check whether every project has an owner with time set aside.",
  },
  {
    name: "Production data capture lags behind the digitisation of sales and finance.",
    context: "There is no current national data on shop-floor digitalisation, so this is a gap in the evidence, not a finding.",
    src: [],
    test: "Comparing the scores for \"Production and operations\" with those for \"Customers\" and \"Order-to-cash\" within the same firm.",
  },
  {
    name: "Security readiness is below what key foreign customers will soon ask for.",
    context: "In 2024, 31.3% of Bulgarian enterprises applied at least 5 of 11 security measures, against 56.9% in the EU. In a spring 2025 pulse survey by the Bulgarian Industrial Association, only 9.4% of firms considered themselves fully ready for NIS2.",
    src: [9],
    test: "Comparing the measures in place with the security questionnaires received from customers in the last 12 months.",
  },
  {
    name: "Funding programmes are used for tools rather than process change.",
    context: "The European Commission notes that support measures have not yet led to large-scale change in SME digital maturity.",
    src: [9],
    test: "A review of funded projects: do they include a process change, an owner and a measurable benefit, or only the purchase of software and hardware?",
  },
];

/* ------------------------------------------------------------------ narrative */
// x = { cite, indicatorTable, fwTable, dimTable, levelTable, lensTable, criteriaAppendix, srcUrl, P }
export const sectionsEn = (x) => {
  const c = x.cite;
  return [
    ["rezyume", "Summary", `
          <div class="glance">
            <ul>
              <li><strong>38.3% of Bulgarian SMEs</strong> (10–249 employees) reached at least a basic level of digital intensity in 2025, against 71.4% in the EU. This is among the lowest levels in the EU and below the trajectory in Bulgaria's national roadmap. ${c(1, 9)}</li>
              <li><strong>Among firms with 50–249 employees</strong> the level is higher, but the gap remains: 55.4% vs 86.7%. 41.9% use an ERP (EU: 69.9%), 16.8% a CRM (EU: 43.8%). ${c(1, 5)}</li>
              <li><strong>The artificial intelligence gap is widening:</strong> for firms with 50–249 employees it grew from 7.5 percentage points in 2023 to 17.1 points in 2025. ${c(2)}</li>
              <li><strong>On security, Bulgaria ranks last in the EU:</strong> 31.3% of Bulgarian enterprises apply at least 5 of 11 cybersecurity measures, against 56.9% in the EU, the lowest share in the EU (2024). ${c(9)}</li>
              <li><strong>We reviewed 6 consulting frameworks and 1 public EU tool.</strong> All combine strategy and operations, but their benchmarks are built on large companies.</li>
              <li><strong>We propose an approach with 8 dimensions and 4 levels</strong>, with 30 observable criteria and a free self-assessment that runs entirely in your browser.</li>
              <li><strong>Five hypotheses</strong> are set out for testing. There are no survey results yet.</li>
            </ul>
          </div>`],

    ["zashto", "1. Why this matters for exporters", `
          <p class="t-body">This whitepaper is for owners and managers of Bulgarian firms with 30–150 employees that export. For them, digital maturity directly shapes how they work with foreign customers: how they take orders, issue documents, trace batches and prove that their data is protected.</p>
          <p class="t-body">The group matters for exports. In 2024, 899 Bulgarian manufacturers with 50–249 employees exported goods, or 28% of all exporting manufacturers. They accounted for 18.0% of the value of manufactured goods exports; 77.1% came from enterprises with 250 or more employees. ${c(8)} These figures show the number of exporters and the value of exports, but not what share of a firm's turnover comes from exports. We found no such indicator by firm size.</p>
          <p class="t-body">The European Commission notes that low SME digital intensity may constrain productivity growth and the position of Bulgarian firms in higher-value segments of European value chains. ${c(9)}</p>`],

    ["dnes", "2. Where we stand today: the data", `
          <p class="t-body">Eurostat measures the digitalisation of enterprises with an annual survey, carried out in Bulgaria by the National Statistical Institute (NSI). The survey covers firms with 10 or more employees. ${c(11)}</p>
          <p class="t-body">In 2025, 38.3% of Bulgarian SMEs (10–249 employees) reached at least a basic level of digital intensity, against 71.4% in the EU. In 2023 the share was 28.4%, against 57.9% in the EU. ${c(1, 9)} Part of this rise may be due to a change in how the index is calculated: in 2025 the social media component was replaced with having a website, which usually scores higher. ${c(10)} According to the European Commission, Bulgaria is behind the trajectory in its national roadmap. ${c(9)}</p>
          ${x.indicatorTable}
          <p class="t-body"><strong>What the table shows.</strong> The gap is largest for the systems that connect functions and turn data into decisions: CRM (16.8% vs 43.8%) and business intelligence software (12.3% vs 34.3%). ${c(5)} The artificial intelligence gap is widening: in 2025, 8.55% of all enterprises with 10 or more employees used at least one AI technology, against 19.95% in the EU. ${c(2)} About 16% of these enterprises sell electronically (16.2% vs 23.6% in the EU). ${c(4)}</p>
          <p class="t-body">The gap in employing ICT specialists is smaller than the technology gaps: 31.5% vs 43.0% for firms with 50–249 employees in 2024. ${c(7)} In a 2025 survey of 847 firms by the Bulgarian Industrial Association, 40% named a lack of digital skills as the main obstacle, 33% financial constraints and 15% limited access to information. ${c(9)}</p>
          <aside class="callout">
            <p class="t-label t-label--accent">How to read these figures</p>
            <ul>
              <li>The national indicator includes firms with 10–49 employees. For the 30–150 segment it is a floor, not a comparison with firms like yours.</li>
              <li>The 50–249 data is closer to the segment, but includes firms of up to 249 people.</li>
              <li>Versions 3 and 4 of the digital intensity index are different indicators. Compare only within one version.</li>
              <li>These data do not show whether exporting firms are more mature than others.</li>
            </ul>
          </aside>`],

    ["ramki", "3. What consulting frameworks offer", `
          <p class="t-body">We reviewed six digital maturity frameworks published by consulting firms, plus one public EU tool. For each we recorded the dimensions, scale, number of criteria, evidence base, date and limits for a firm of about 60 employees.</p>
          ${x.fwTable}
          <p class="t-body"><strong>What we did not use.</strong> We found no usable primary source from McKinsey: mckinsey.com could not be opened from our environment, so we do not rely on secondary descriptions of its Digital Quotient. The PwC and Strategy& Industry 4.0 pages refused access, and Deloitte Romania's main Digital DNA page is no longer available. These frameworks are not in the table. We added Bain, whose page is accessible.</p>
          <h3 class="t-h3">What they have in common: our reading</h3>
          <ul class="ticks">
            <li>All frameworks combine strategy and operations. Deloitte reports that focusing on only one of the two does not deliver the expected effect on profit and revenue. ${c(14)}</li>
            <li>Scales have 3 to 6 levels and describe a move from isolated initiatives to company-wide change. ${c(12, 13, 14, 15)}</li>
            <li>KPMG separates two perspectives: how deliberately digitalisation is managed and how widely it is used. ${c(15)} We borrow this idea.</li>
            <li>Consulting benchmarks are built mainly on large companies. For a 60-person firm, a comparison with "leaders" is less useful than a profile against its own targets.</li>
          </ul>`],

    ["podhod", "4. An eight-dimension assessment approach", `
          <p class="callout callout--plain"><strong>MSP Compass's own approach.</strong> It is built from the frameworks reviewed and adapted to firms with 30–150 employees. It has not yet been tested with a survey.</p>
          <h3 class="t-h3">Four principles</h3>
          <ol class="steps-big">
            ${PRINCIPLES_WP_EN.map((p) => `<li><div class="stack stack--xs"><h4 class="t-h4">${p.name}</h4><p class="t-body">${p.text}</p></div></li>`).join("\n            ")}
          </ol>
          <h3 class="t-h3">Eight dimensions</h3>
          ${x.dimTable}
          <h3 class="t-h3">Four levels</h3>
          <p class="t-body">Each of the 30 criteria has a description for every level that can be checked on site. The full list is in the <a href="#${x.P}kriterii">appendix</a> and in the <a href="samoocenka-digitalna-zrelost.html">self-assessment</a> (in Bulgarian).</p>
          ${x.levelTable}
          <h3 class="t-h3">Two perspectives</h3>
          <p class="t-body">Each dimension also gets two questions: how deliberately it is managed and how widely it is used. A firm can have a well-managed project used in only one department, or the reverse. The two scores show where the problem lies.</p>
          ${x.lensTable}`],

    ["proces", "5. The process: 4–6 weeks", `
          <ol class="steps-big">
            ${PROCESS_EN.map((p) => `<li><div class="stack stack--xs"><p class="t-label t-label--accent">${p.when}</p><h3 class="t-h4">${p.name}</h3><p class="t-body">${p.text}</p></div></li>`).join("\n            ")}
          </ol>`],

    ["kapani", "6. Five pitfalls", `
          <ul class="pitfalls">
            ${PITFALLS_EN.map((p) => `<li><strong>${p.name}.</strong> ${p.text}</li>`).join("\n            ")}
          </ul>`],

    ["mostove", "7. Tools for the transition", `
          <h3 class="t-h3">Self-assessment</h3>
          <p class="t-body">The <a href="samoocenka-digitalna-zrelost.html">self-assessment</a> (in Bulgarian) uses the same 30 criteria. It shows a profile by dimension, the weakest criterion in each dimension and what the next level looks like. It is calculated entirely in your browser; nothing is sent.</p>
          <h3 class="t-h3">Assessment through a European Digital Innovation Hub</h3>
          <p class="t-body">Bulgaria has 12 European Digital Innovation Hubs (EDIH), funded with EUR 31.8 million under the PRIDST programme. ${c(9)} They apply the EU-wide DMA tool before and after their support. ${c(18)} According to the European Commission, access to their services is hampered by administrative complexity. ${c(9)} The list of hubs is in the <a href="${x.srcUrl(21)}" rel="noopener">Commission's catalogue</a>. ${c(21)}</p>
          <h3 class="t-h3">Funding programmes</h3>
          <div class="table-wrap" role="region" aria-label="Table: funding programmes" tabindex="0">
            <table class="data-table data-table--stack">
              <caption>Verified details of 2021–2027 programmes (conditions change; always check the current call)</caption>
              <thead><tr><th scope="col">Programme or measure</th><th scope="col">What it funds</th><th scope="col">Who can apply</th><th scope="col">Note</th></tr></thead>
              <tbody>
                <tr><th scope="row">PCIE (ПКИП), "Digitalisation of Enterprises" (methodology of April 2025) ${c(19)}</th><td data-label="What it funds">ICT investments; BGN 5,000 to 50,000 per project, up to 70% grant, de minimis regime; total budget BGN 80 million</td><td data-label="Who can apply">Micro and small enterprises only</td><td data-label="Note">Firms with 50 or more employees are not eligible for this call.</td></tr>
                <tr><th scope="row">PCIE (ПКИП) measures "Digitalisation of Enterprises" and "Introduction of Industry 4.0 Technologies" ${c(9)}</th><td data-label="What it funds">According to the Commission: over 1,600 approved projects worth EUR 29.58 million, to be implemented from 2026</td><td data-label="Who can apply">We have not verified the conditions for medium-sized firms</td><td data-label="Note">Check in ISUN. ${c(20)}</td></tr>
                <tr><th scope="row">HRDP (ПРЧР, Human Resources Development Programme) ${c(9)}</th><td data-label="What it funds">Digital skills training for employees: operations "Digital Skills" (EUR 20.5 million), "New Skills" (EUR 38 million) and "Qualification, Skills and Career Development of Employed Persons" (about EUR 62 million)</td><td data-label="Who can apply">Workers and firms</td><td data-label="Note">Names as given in the Commission's report; check the Bulgarian titles and conditions in ISUN. ${c(20)}</td></tr>
                <tr><th scope="row">"Digital Bulgaria – SMEs" ${c(9)}</th><td data-label="What it funds">Cybersecurity grants: 61 contracts worth about EUR 1.8 million (June 2025 – March 2026)</td><td data-label="Who can apply">SMEs</td><td data-label="Note">Closed; shows the direction of support.</td></tr>
              </tbody>
            </table>
          </div>`],

    ["posoka", "8. Where requirements are heading", `
          <p class="callout callout--plain"><strong>Interpretation.</strong> This section is our reading of the sources, not established fact.</p>
          <h3 class="t-h4">Data and AI foundations become a precondition</h3>
          <p class="t-body">Fact: among firms with 50–249 employees, AI use in Bulgaria rose from 5.5% in 2023 to 13.3% in 2025, while in the EU it rose from 13.1% to 30.4%. ${c(2)} The European Commission recommends that Bulgaria accelerate the use of AI, cloud and data analytics among SMEs through more advisory support and skills. ${c(9)}</p>
          <p class="t-body">Interpretation: AI only pays off on top of orderly master data and connected systems. For most mid-sized firms the first step towards AI is probably the "Data and technology foundation" dimension, not a new tool.</p>
          <h3 class="t-h4">Security and data become buyer requirements</h3>
          <p class="t-body">Fact: in February 2026 Bulgaria transposed the NIS2 Directive into its Cybersecurity Act. It covers 18 sectors, with stricter risk management and reporting requirements for medium and large businesses. ${c(9)} In a spring 2025 pulse survey by the Bulgarian Industrial Association, only 9.4% of firms considered themselves fully ready, and more than a third had not started preparing or were unaware of their obligations. ${c(9)}</p>
          <p class="t-body">Interpretation: customers within the scope of NIS2 will ask their suppliers for more evidence of security. For exporters, security questionnaires are likely to become part of the commercial conversation.</p>`],

    ["hipotezi", "9. Hypotheses to test", `
          <p class="callout callout--plain"><strong>These are hypotheses, not findings.</strong> There are no survey results yet. Each hypothesis comes with the available data and how we will test it.</p>
          <ol class="hypotheses">
            ${HYPOTHESES_EN.map((h, i) => `<li>
              <p class="t-label t-label--accent">Hypothesis ${i + 1}</p>
              <h3 class="t-h4">${h.name}</h3>
              <p class="t-body"><strong>What we know.</strong> ${h.context} ${h.src.length ? c(...h.src) : ""}</p>
              <p class="t-body"><strong>How we will test it.</strong> ${h.test}</p>
            </li>`).join("\n            ")}
          </ol>`],

    ["kriterii", "Appendix: 30 criteria with level definitions", `
          <p class="t-body no-print">Open a dimension to see its criteria. When printing, all of them open automatically.</p>
          ${x.criteriaAppendix}`],

    ["metodologia", "Methodological notes and limits", `
          <ul class="ticks">
            <li>Eurostat data was downloaded from the official API on 3 November 2026. Percentages are rounded to one decimal place.</li>
            <li>"SME" in Eurostat and Commission data means enterprises with 10–249 employees. Micro-enterprises are not included.</li>
            <li>The Commission states that 13.90% of SMEs sell online, while Eurostat's tables show 14.85% for web sales and 15.87% for all e-commerce sales (10–249 employees, 2025). We could not establish the reason for the difference, so we use Eurostat's tables.</li>
            <li>The Commission's cloud indicator (15.74%) differs from Eurostat's indicator for purchased cloud services (17.83% for 10+ employees, 2025). We use Eurostat's indicator.</li>
            <li>Export data by enterprise size is for 2024 and covers goods only.</li>
            <li>The 2023 edition of Deloitte Germany's Digital Maturity Index could not be opened; we cite the 2025 edition.</li>
            <li>We do not use sources we could not open.</li>
          </ul>`],

    ["iztochnici", "Sources", `
          ${x.sourcesList}
          <p class="t-small">All links checked on 3 November 2026.</p>`],
  ];
};

export const TOC_EN = [
  ["rezyume", "Summary"],
  ["zashto", "1. Why this matters"],
  ["dnes", "2. Where we stand today"],
  ["ramki", "3. What consulting frameworks offer"],
  ["podhod", "4. Eight-dimension approach"],
  ["proces", "5. The process: 4–6 weeks"],
  ["kapani", "6. Five pitfalls"],
  ["mostove", "7. Tools for the transition"],
  ["posoka", "8. Where requirements are heading"],
  ["hipotezi", "9. Hypotheses to test"],
  ["kriterii", "Appendix: 30 criteria"],
  ["metodologia", "Methodological notes"],
  ["iztochnici", "Sources"],
];
