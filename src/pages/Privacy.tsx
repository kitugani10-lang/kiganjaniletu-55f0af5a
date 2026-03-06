import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <Link to="/">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Button>
      </Link>

      <article className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">Last updated: March 2026</p>

        <section>
          <h2 className="text-lg font-semibold">1. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
            <li>Email address (for authentication)</li>
            <li>First name, last name, and username</li>
            <li>Posts, comments, and interactions</li>
            <li>IP addresses (for security and moderation)</li>
            <li>Profile information you choose to provide (location, age, gender)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Why We Collect Data</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
            <li>To operate and maintain the Kanisa Kiganjani community forum</li>
            <li>To moderate content and enforce community guidelines</li>
            <li>To prevent spam, abuse, and unauthorized access</li>
            <li>To improve user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Data Sharing</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
            <li>We <strong>do not sell</strong> your personal data to anyone</li>
            <li>IP addresses are <strong>never shared, sold, or misused</strong></li>
            <li>Your data may be processed by trusted service providers solely for operational purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
            <li>User data is kept as long as your account is active</li>
            <li>We may retain certain data as required for moderation and legal compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Your Rights</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
            <li>You can request deletion of your account and all associated data</li>
            <li>Email us at <a href="mailto:support@kanisakiganjani.com" className="text-primary hover:underline">support@kanisakiganjani.com</a> to request data deletion</li>
            <li>You can edit or delete your posts and comments within the allowed time frames</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Contact</h2>
          <p className="text-sm text-foreground/90">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@kanisakiganjani.com" className="text-primary hover:underline">
              support@kanisakiganjani.com
            </a>
          </p>
        </section>
      </article>
    </main>
  </div>
);

export default Privacy;
