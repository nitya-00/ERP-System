import { Link } from "react-router-dom";
import { Badge, Card, Icon, PageHead } from "../../components/ui";
import { backendModules } from "../../data/backendArchitecture";

const toneClass = (tone: string) => `bg-${tone}`;

export default function Architecture() {
  return (
    <>
      <PageHead
        title="Backend Architecture"
        desc="A safe, phased path from the current demo data to a production-ready school ERP."
        actions={<Link className="btn btn-outline" to="/admin/students"><Icon name="users" size={16} /> View current data</Link>}
      />

      <div className="architecture-hero">
        <div>
          <span className="eyebrow">Recommended starting point</span>
          <h2>Modular monolith, not microservices</h2>
          <p>One TypeScript API and one PostgreSQL database, split into clear business modules. It is easier to ship, secure and operate now, while each module stays ready to separate later if scale demands it.</p>
        </div>
        <div className="architecture-pillars">
          <div><Icon name="shield" size={18} /><span>Role-based access</span></div>
          <div><Icon name="file" size={18} /><span>Audit trail</span></div>
          <div><Icon name="chart" size={18} /><span>PostgreSQL reporting</span></div>
        </div>
      </div>

      <section className="architecture-flow" aria-label="System layers">
        <div className="architecture-layer client"><b>ERP portals</b><span>Admin · Teacher · Parent · Student</span></div>
        <div className="architecture-arrow">↓</div>
        <div className="architecture-layer api"><b>API boundary</b><span>Auth · validation · permissions · audit</span></div>
        <div className="architecture-arrow">↓</div>
        <div className="architecture-layer domain"><b>Business modules</b><span>Feature rules and services</span></div>
        <div className="architecture-arrow">↓</div>
        <div className="architecture-layer data"><b>PostgreSQL + object storage</b><span>Transactional records · document metadata</span></div>
      </section>

      <div className="architecture-note"><Icon name="shield" size={17} /><span><b>Tenant rule:</b> every school-owned record carries a <code>school_id</code>; the browser talks only to the API, never directly to the database.</span></div>

      <div className="architecture-modules">
        {backendModules.map((module) => (
          <Card key={module.id} className="architecture-module">
            <div className={`architecture-module-icon ${toneClass(module.tone)}`}><Icon name={module.id === "fees" ? "wallet" : module.id === "attendance" ? "check" : module.id === "exams" ? "file" : module.id === "communication" ? "mega" : module.id === "admissions" ? "userPlus" : module.id === "academics" ? "book" : module.id === "students" ? "users" : "shield"} size={18} /></div>
            <div className="architecture-module-top"><h3>{module.name}</h3><Badge tone="b-gray">{module.phase}</Badge></div>
            <p>{module.description}</p>
            <div className="architecture-owned">Owns: {module.owns}</div>
          </Card>
        ))}
      </div>

      <div className="grid g-2 mt">
        <Card title="First API slice" sub="Small enough to validate safely">
          <ol className="architecture-list">
            <li><code>POST /v1/auth/login</code> and token refresh</li>
            <li><code>GET /v1/me</code> for portal identity and permissions</li>
            <li><code>GET /v1/students</code> with search and pagination</li>
            <li><code>GET /v1/students/:id</code> for the student profile</li>
          </ol>
        </Card>
        <Card title="Migration rule" sub="Avoid a risky big-bang rewrite">
          <p className="architecture-copy">Keep the mock data in place initially. Add a typed API client, replace student list reads behind a <code>mock | api</code> flag, then migrate one feature at a time: admissions, attendance, fees, and marks.</p>
        </Card>
      </div>
    </>
  );
}
