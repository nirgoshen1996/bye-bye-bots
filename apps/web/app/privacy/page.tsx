import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Database, 
  CreditCard, 
  Mail, 
  Eye, 
  Lock, 
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Container className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <Badge variant="secondary" className="mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ByeByeBots.io ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our email cleaning service.
              </p>
              <p className="text-muted-foreground">
                By using our service, you agree to the collection and use of information in 
                accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Email addresses and names from your uploaded CSV files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Billing information (processed securely through Stripe)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Account information (email, password, subscription details)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Processing history and file uploads</li>
                  <li>• Service usage patterns and preferences</li>
                  <li>• Device information and IP addresses</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Provide and maintain our email cleaning service</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Process payments and manage subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Improve our service and develop new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Communicate with you about your account and service updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Ensure security and prevent fraud</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Data Sharing and Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                <p className="font-semibold text-accent mb-2">
                  We do NOT sell your personal data to third parties.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your data is never sold, rented, or shared for marketing purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Third-Party Services</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h4 className="font-medium mb-2">Stripe (Payment Processing)</h4>
                    <p className="text-sm text-muted-foreground">
                      We use Stripe to process payments securely. Stripe handles your billing 
                      information according to their privacy policy and PCI compliance standards.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h4 className="font-medium mb-2">Supabase (Database & Authentication)</h4>
                    <p className="text-sm text-muted-foreground">
                      We use Supabase for secure data storage and user authentication. 
                      All data is encrypted in transit and at rest.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• End-to-end encryption for all data transmission</li>
                <li>• Secure data storage with encryption at rest</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication protocols</li>
                <li>• Automatic data deletion after processing</li>
              </ul>
            </CardContent>
          </Card>

          {/* GDPR & CCPA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Your Rights (GDPR & CCPA Compliance)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">Access & Portability</h4>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of your personal data in a portable format.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">Correction</h4>
                  <p className="text-sm text-muted-foreground">
                    Update or correct inaccurate personal information.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">Deletion</h4>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your personal data and account.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">Opt-out</h4>
                  <p className="text-sm text-muted-foreground">
                    Opt-out of marketing communications and data processing.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                To exercise these rights, contact us at privacy@byebyebots.io
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We retain your data only as long as necessary:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Uploaded files:</strong> Automatically deleted after 7 days</li>
                <li>• <strong>Processing results:</strong> Available for 30 days, then deleted</li>
                <li>• <strong>Account data:</strong> Retained while your account is active</li>
                <li>• <strong>Billing records:</strong> Retained for legal and tax purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="font-medium">ByeByeBots.io</p>
                <p className="text-sm text-muted-foreground">Email: privacy@byebyebots.io</p>
                <p className="text-sm text-muted-foreground">Website: https://byebyebots.io</p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" 
                date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
