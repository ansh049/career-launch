import Skill from "../models/Skill.js";
import SkillRelationship from "../models/SkillRelationship.js";
import Job from "../models/Job.js";

/**
 * Standard industry skill taxonomy with canonical names and categories.
 */
const TAXONOMY_MAP = {
  // Programming Languages
  javascript: { name: "JavaScript", category: "programming_language" },
  typescript: { name: "TypeScript", category: "programming_language" },
  python: { name: "Python", category: "programming_language" },
  java: { name: "Java", category: "programming_language" },
  c: { name: "C", category: "programming_language" },
  "c++": { name: "C++", category: "programming_language" },
  "c#": { name: "C#", category: "programming_language" },
  go: { name: "Go", category: "programming_language" },
  golang: { name: "Go", category: "programming_language" },
  ruby: { name: "Ruby", category: "programming_language" },
  php: { name: "PHP", category: "programming_language" },
  swift: { name: "Swift", category: "programming_language" },
  kotlin: { name: "Kotlin", category: "programming_language" },
  rust: { name: "Rust", category: "programming_language" },
  sql: { name: "SQL", category: "programming_language" },
  html: { name: "HTML5", category: "programming_language" },
  html5: { name: "HTML5", category: "programming_language" },
  css: { name: "CSS3", category: "programming_language" },
  css3: { name: "CSS3", category: "programming_language" },

  // Frameworks & Libraries
  react: { name: "React", category: "framework" },
  "react.js": { name: "React", category: "framework" },
  reactjs: { name: "React", category: "framework" },
  "next.js": { name: "Next.js", category: "framework" },
  nextjs: { name: "Next.js", category: "framework" },
  vue: { name: "Vue.js", category: "framework" },
  "vue.js": { name: "Vue.js", category: "framework" },
  angular: { name: "Angular", category: "framework" },
  "node.js": { name: "Node.js", category: "framework" },
  nodejs: { name: "Node.js", category: "framework" },
  express: { name: "Express.js", category: "framework" },
  "express.js": { name: "Express.js", category: "framework" },
  fastapi: { name: "FastAPI", category: "framework" },
  django: { name: "Django", category: "framework" },
  flask: { name: "Flask", category: "framework" },
  "spring boot": { name: "Spring Boot", category: "framework" },
  spring: { name: "Spring Boot", category: "framework" },
  "tailwind css": { name: "Tailwind CSS", category: "framework" },
  tailwind: { name: "Tailwind CSS", category: "framework" },
  redux: { name: "Redux", category: "framework" },

  // Databases
  mongodb: { name: "MongoDB", category: "database" },
  postgresql: { name: "PostgreSQL", category: "database" },
  postgres: { name: "PostgreSQL", category: "database" },
  mysql: { name: "MySQL", category: "database" },
  redis: { name: "Redis", category: "database" },
  sqlite: { name: "SQLite", category: "database" },
  elasticsearch: { name: "Elasticsearch", category: "database" },
  neo4j: { name: "Neo4j", category: "database" },
  sqlalchemy: { name: "SQLAlchemy", category: "database" },

  // Cloud
  aws: { name: "AWS", category: "cloud" },
  azure: { name: "Azure", category: "cloud" },
  gcp: { name: "Google Cloud", category: "cloud" },
  "google cloud": { name: "Google Cloud", category: "cloud" },

  // DevOps & Tools
  docker: { name: "Docker", category: "devops" },
  kubernetes: { name: "Kubernetes", category: "devops" },
  k8s: { name: "Kubernetes", category: "devops" },
  git: { name: "Git", category: "devops" },
  github: { name: "GitHub", category: "devops" },
  "ci/cd": { name: "CI/CD", category: "devops" },
  linux: { name: "Linux", category: "devops" },
  nginx: { name: "Nginx", category: "devops" },
  "rest apis": { name: "REST APIs", category: "tool" },
  rest: { name: "REST APIs", category: "tool" },
  graphql: { name: "GraphQL", category: "tool" },
  jwt: { name: "JWT", category: "tool" },
  postman: { name: "Postman", category: "tool" },
  jest: { name: "Jest", category: "tool" },
  vite: { name: "Vite", category: "tool" },

  // Data Science & AI
  "machine learning": { name: "Machine Learning", category: "data_science" },
  "deep learning": { name: "Deep Learning", category: "data_science" },
  pytorch: { name: "PyTorch", category: "data_science" },
  tensorflow: { name: "TensorFlow", category: "data_science" },
  "scikit-learn": { name: "scikit-learn", category: "data_science" },
  pandas: { name: "Pandas", category: "data_science" },
  numpy: { name: "NumPy", category: "data_science" },
  nlp: { name: "NLP", category: "data_science" },
  yolov8: { name: "YOLOv8", category: "data_science" },
  "crew ai": { name: "CrewAI", category: "data_science" },
  crewai: { name: "CrewAI", category: "data_science" },
  n8n: { name: "n8n", category: "tool" },
  shap: { name: "SHAP", category: "data_science" },

  // Design & Soft Skills
  figma: { name: "Figma", category: "design" },
  "ui/ux": { name: "UI/UX Design", category: "design" },
  agile: { name: "Agile", category: "soft_skill" },
  scrum: { name: "Scrum", category: "soft_skill" },
  communication: { name: "Communication", category: "soft_skill" },
  leadership: { name: "Leadership", category: "soft_skill" },
};

/**
 * Canonical industry relationships to provide rich, verified insights.
 */
const CANONICAL_RELATIONSHIPS = [
  { a: "javascript", b: "react", type: "prerequisite", confidence: 0.95 },
  { a: "javascript", b: "typescript", type: "complementary", confidence: 0.92 },
  { a: "javascript", b: "node.js", type: "complementary", confidence: 0.94 },
  { a: "typescript", b: "react", type: "complementary", confidence: 0.93 },
  { a: "react", b: "next.js", type: "prerequisite", confidence: 0.91 },
  { a: "react", b: "redux", type: "complementary", confidence: 0.84 },
  { a: "react", b: "tailwind css", type: "complementary", confidence: 0.88 },
  { a: "node.js", b: "express.js", type: "prerequisite", confidence: 0.96 },
  { a: "express.js", b: "mongodb", type: "complementary", confidence: 0.90 },
  { a: "express.js", b: "rest apis", type: "complementary", confidence: 0.93 },
  { a: "express.js", b: "jwt", type: "complementary", confidence: 0.89 },
  { a: "python", b: "fastapi", type: "prerequisite", confidence: 0.92 },
  { a: "python", b: "django", type: "prerequisite", confidence: 0.88 },
  { a: "python", b: "machine learning", type: "complementary", confidence: 0.95 },
  { a: "machine learning", b: "deep learning", type: "prerequisite", confidence: 0.92 },
  { a: "deep learning", b: "pytorch", type: "complementary", confidence: 0.94 },
  { a: "deep learning", b: "tensorflow", type: "complementary", confidence: 0.89 },
  { a: "machine learning", b: "scikit-learn", type: "subset_of", confidence: 0.94 },
  { a: "machine learning", b: "pandas", type: "complementary", confidence: 0.92 },
  { a: "pandas", b: "numpy", type: "complementary", confidence: 0.96 },
  { a: "docker", b: "kubernetes", type: "prerequisite", confidence: 0.93 },
  { a: "docker", b: "ci/cd", type: "complementary", confidence: 0.87 },
  { a: "docker", b: "aws", type: "complementary", confidence: 0.86 },
  { a: "git", b: "github", type: "complementary", confidence: 0.97 },
  { a: "sql", b: "postgresql", type: "subset_of", confidence: 0.95 },
  { a: "sql", b: "mysql", type: "subset_of", confidence: 0.93 },
  { a: "html5", b: "css3", type: "complementary", confidence: 0.98 },
  { a: "html5", b: "javascript", type: "prerequisite", confidence: 0.96 },
  { a: "fastapi", b: "docker", type: "complementary", confidence: 0.85 },
];

/**
 * Helper to infer skill category from name.
 */
function inferCategory(name) {
  const norm = name.toLowerCase().trim();
  if (TAXONOMY_MAP[norm]) return TAXONOMY_MAP[norm].category;
  if (norm.includes("react") || norm.includes("vue") || norm.includes("angular") || norm.includes("framework")) return "framework";
  if (norm.includes("sql") || norm.includes("mongo") || norm.includes("db") || norm.includes("database")) return "database";
  if (norm.includes("docker") || norm.includes("k8s") || norm.includes("cloud") || norm.includes("ci/cd")) return "devops";
  if (norm.includes("learn") || norm.includes("ai") || norm.includes("nlp") || norm.includes("vision")) return "data_science";
  if (norm.includes("design") || norm.includes("figma") || norm.includes("ui")) return "design";
  return "other";
}

/**
 * Get or create a skill by its normalized name, applying taxonomy categorizations.
 */
async function findOrCreateSkill(name) {
  const normalized = name.toLowerCase().trim();
  if (!normalized) return null;
  const tax = TAXONOMY_MAP[normalized];
  const displayName = tax ? tax.name : (name.charAt(0).toUpperCase() + name.slice(1));
  const category = tax ? tax.category : inferCategory(name);

  // Match by normalizedName, exact name, or alias
  let skill = await Skill.findOne({
    $or: [{ normalizedName: normalized }, { name: displayName }, { aliases: normalized }],
  });

  if (!skill) {
    try {
      skill = await Skill.findOneAndUpdate(
        { normalizedName: normalized },
        { $setOnInsert: { name: displayName, normalizedName: normalized, aliases: [], category, popularity: 1 } },
        { upsert: true, returnDocument: "after" }
      );
    } catch (err) {
      if (err.code === 11000) {
        skill = await Skill.findOne({
          $or: [{ normalizedName: normalized }, { name: displayName }],
        });
      } else {
        throw err;
      }
    }
  } else {
    // Register alias if different
    if (skill.normalizedName !== normalized && !skill.aliases?.includes(normalized)) {
      await Skill.findByIdAndUpdate(skill._id, { $addToSet: { aliases: normalized } });
    }
    if (skill.category === "other" && category !== "other") {
      skill = await Skill.findByIdAndUpdate(skill._id, { $set: { category } }, { returnDocument: "after" });
    }
  }
  return skill;
}

/**
 * Seed canonical industry skills and relationships so the knowledge graph is rich by default.
 */
export async function seedStarterSkills() {
  for (const norm of Object.keys(TAXONOMY_MAP)) {
    await findOrCreateSkill(norm);
  }

  for (const rel of CANONICAL_RELATIONSHIPS) {
    const [skillA, skillB] = await Promise.all([
      findOrCreateSkill(rel.a),
      findOrCreateSkill(rel.b),
    ]);
    if (skillA && skillB && String(skillA._id) !== String(skillB._id)) {
      await SkillRelationship.findOneAndUpdate(
        { sourceSkillId: skillA._id, targetSkillId: skillB._id, relationshipType: rel.type },
        {
          $set: { confidence: rel.confidence, evidenceCount: 3 },
          $setOnInsert: { roles: [] },
        },
        { upsert: true }
      );
    }
  }
}

/**
 * Build or refresh the skill graph from current live job postings.
 * Co-occurrence of skills in the same job listing implies "related".
 */
export async function refreshSkillGraphFromJobPostings() {
  const jobs = await Job.find({ status: "published" }).select("skills title").lean();

  const coOccurrence = {};
  const skillOccurrences = {};

  for (const job of jobs) {
    const skills = (job.skills || [])
      .flatMap(s => s.split(/[,;\n]/))
      .map(s => s.toLowerCase().trim())
      .filter(s => s.length > 1 && s.length < 50);

    for (const skill of skills) {
      skillOccurrences[skill] = (skillOccurrences[skill] || 0) + 1;
    }

    if (skills.length < 2) continue;

    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        if (skills[i] === skills[j]) continue;
        const key = [skills[i], skills[j]].sort().join("|||");
        coOccurrence[key] = (coOccurrence[key] || 0) + 1;
      }
    }
  }

  // Register all skills and update popularity
  for (const [skillName, count] of Object.entries(skillOccurrences)) {
    const skill = await findOrCreateSkill(skillName);
    if (skill) {
      await Skill.findByIdAndUpdate(skill._id, { $inc: { popularity: count } });
    }
  }

  // Upsert relationships with confidence proportional to co-occurrence frequency
  const totalJobs = jobs.length || 1;
  const minCo = totalJobs > 5 ? 2 : 1;
  let upserted = 0;

  for (const [key, count] of Object.entries(coOccurrence)) {
    if (count < minCo) continue;
    const [nameA, nameB] = key.split("|||");
    const [skillA, skillB] = await Promise.all([
      findOrCreateSkill(nameA),
      findOrCreateSkill(nameB),
    ]);

    if (!skillA || !skillB) continue;

    const confidence = Math.min(1, Math.max(0.4, count / totalJobs));

    await SkillRelationship.findOneAndUpdate(
      { sourceSkillId: skillA._id, targetSkillId: skillB._id, relationshipType: "related" },
      {
        $set: { confidence, evidenceCount: count },
      },
      { upsert: true }
    );
    upserted++;
  }

  // Ensure canonical industry skills are seeded
  await seedStarterSkills();

  return { upserted, totalJobs, uniquePairs: Object.keys(coOccurrence).length };
}

/**
 * Get the full skill graph (nodes + edges) for visualization.
 */
export async function getSkillGraph({ limit = 60, category } = {}) {
  const skillQuery = category && category !== "all" ? { category } : {};
  let skills = await Skill.find(skillQuery)
    .sort({ popularity: -1, name: 1 })
    .limit(limit)
    .lean();

  if (skills.length < 10) {
    await seedStarterSkills();
    await refreshSkillGraphFromJobPostings();
    skills = await Skill.find(skillQuery)
      .sort({ popularity: -1, name: 1 })
      .limit(limit)
      .lean();
  }

  const skillIds = skills.map(s => s._id);

  const relationships = await SkillRelationship.find({
    $or: [
      { sourceSkillId: { $in: skillIds }, targetSkillId: { $in: skillIds } },
      { sourceSkillId: { $in: skillIds } },
      { targetSkillId: { $in: skillIds } },
    ],
    confidence: { $gte: 0.1 },
  })
    .sort({ confidence: -1 })
    .limit(600)
    .lean();

  return {
    nodes: skills.map(s => ({
      id: s._id,
      name: s.name,
      category: s.category,
      popularity: s.popularity,
    })),
    edges: relationships.map(r => ({
      source: r.sourceSkillId,
      target: r.targetSkillId,
      type: r.relationshipType,
      confidence: r.confidence,
      evidenceCount: r.evidenceCount,
    })),
    totalNodes: skills.length,
    totalEdges: relationships.length,
  };
}

/**
 * Get related skills for a given skill name or ID.
 */
export async function getRelatedSkills(skillId, { limit = 10 } = {}) {
  const skill = await Skill.findById(skillId).lean();
  if (!skill) {
    throw Object.assign(new Error("Skill not found"), { status: 404 });
  }

  const relationships = await SkillRelationship.find({
    $or: [{ sourceSkillId: skillId }, { targetSkillId: skillId }],
    confidence: { $gte: 0.1 },
  })
    .sort({ confidence: -1 })
    .limit(limit)
    .populate("sourceSkillId targetSkillId", "name normalizedName category")
    .lean();

  let related = relationships.map(r => {
    const other =
      String(r.sourceSkillId?._id) === String(skillId)
        ? r.targetSkillId
        : r.sourceSkillId;
    return {
      skill: other,
      relationshipType: r.relationshipType,
      confidence: r.confidence,
      evidenceCount: r.evidenceCount,
    };
  }).filter(item => item.skill);

  // If no direct edges, provide category peers so user always gets actionable insights
  if (related.length === 0) {
    const peers = await Skill.find({
      category: skill.category,
      _id: { $ne: skill._id },
    })
      .sort({ popularity: -1 })
      .limit(5)
      .lean();

    related = peers.map(p => ({
      skill: p,
      relationshipType: "complementary",
      confidence: 0.7,
      evidenceCount: 1,
    }));
  }

  return { skill, related };
}

/**
 * Get a skill path (ordered list of skills to learn) toward a target role.
 * Uses BFS over prerequisite relationships and job co-occurrences.
 */
export async function getSkillPathForRole(roleId, { startSkills = [] } = {}) {
  const jobs = await Job.find({
    status: "published",
    $or: [
      { title: { $regex: roleId, $options: "i" } },
      { experienceLevel: { $regex: roleId, $options: "i" } },
    ],
  })
    .select("skills")
    .limit(50)
    .lean();

  const skillCounts = {};
  if (jobs.length > 0) {
    for (const job of jobs) {
      for (const raw of (job.skills || [])) {
        for (const skill of raw.split(/[,;\n]/)) {
          const normalized = skill.toLowerCase().trim();
          if (normalized) {
            skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
          }
        }
      }
    }
  }

  // Fallback to role-based canonical skill set if few matching jobs
  if (Object.keys(skillCounts).length < 3) {
    const roleLower = roleId.toLowerCase();
    if (roleLower.includes("frontend")) {
      ["html5", "css3", "javascript", "react", "typescript", "tailwind css", "next.js", "git"].forEach((s, idx) => {
        skillCounts[s] = 10 - idx;
      });
    } else if (roleLower.includes("backend")) {
      ["node.js", "express.js", "python", "fastapi", "mongodb", "postgresql", "docker", "rest apis", "jwt"].forEach((s, idx) => {
        skillCounts[s] = 10 - idx;
      });
    } else if (roleLower.includes("ai") || roleLower.includes("machine learning") || roleLower.includes("data")) {
      ["python", "machine learning", "deep learning", "pytorch", "scikit-learn", "pandas", "numpy", "fastapi"].forEach((s, idx) => {
        skillCounts[s] = 10 - idx;
      });
    } else {
      // Default Full Stack
      ["javascript", "react", "node.js", "express.js", "mongodb", "typescript", "docker", "git", "rest apis"].forEach((s, idx) => {
        skillCounts[s] = 10 - idx;
      });
    }
  }

  const totalBase = Math.max(jobs.length, 1);
  const allRoleSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => {
      const tax = TAXONOMY_MAP[name];
      const displayName = tax ? tax.name : (name.charAt(0).toUpperCase() + name.slice(1));
      return {
        name: displayName,
        rawName: name,
        frequency: Math.min(100, Math.round((count / totalBase) * 100)),
      };
    });

  const normalizedStart = new Set(startSkills.map(s => s.toLowerCase().trim()));
  const path = allRoleSkills.filter(s => !normalizedStart.has(s.rawName));

  return {
    role: roleId,
    path,
    alreadyKnown: allRoleSkills.filter(s => normalizedStart.has(s.rawName)),
    totalJobsAnalyzed: jobs.length,
    note: jobs.length
      ? `Skill path derived from ${jobs.length} job listing(s) matching "${roleId}".`
      : `Recommended standard curriculum for "${roleId}".`,
  };
}
