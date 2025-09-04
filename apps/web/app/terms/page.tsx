import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  CreditCard, 
  Shield, 
  Scale, 
  Users,
  Globe,
  Clock,
  Ban,
  CheckCircle
} from 'lucide-react';

export default function TermsOfServicePage() {
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
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using our email cleaning service.
            </p>
            <Badge variant="secondary" className="mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms of Service ("Terms") govern your use of ByeByeBots.io ("Service") 
                operated by ByeByeBots ("us," "we," or "our").
              </p>
              <p className="text-muted-foreground">
                By accessing or using our Service, you agree to be bound by these Terms. 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ByeByeBots.io provides email list cleaning and bot detection services. Our service:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                  <span>Analyzes email addresses for validity and bot characteristics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                  <span>Provides detailed reports on email list quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                  <span>Offers various subscription plans and pay-as-you-go options</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Service Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warning/10 rounded-xl border border-warning/20">
                <p className="font-semibold text-warning mb-2">
                  Service Provided "As Is"
                </p>
                <p className="text-sm text-muted-foreground">
                  Our service is provided on an "as is" and "as available" basis. We do not 
                  guarantee 100% accuracy in bot detection or email validation.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We strive for high accuracy but cannot guarantee perfect results</li>
                <li>• Service may be temporarily unavailable for maintenance</li>
                <li>• Processing times may vary based on file size and server load</li>
                <li>• We reserve the right to modify or discontinue the service</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                As a user of our service, you agree to:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Provide accurate and complete information when creating your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Use the service only for lawful purposes and in compliance with applicable laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Comply with spam and data protection regulations in your jurisdiction</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Not attempt to reverse engineer or compromise our systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Maintain the confidentiality of your account credentials</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                You may not use our service for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Spam, phishing, or other malicious activities</li>
                <li>• Violating any applicable laws or regulations</li>
                <li>• Infringing on intellectual property rights</li>
                <li>• Harassing, abusing, or harming others</li>
                <li>• Attempting to gain unauthorized access to our systems</li>
                <li>• Using automated tools to abuse our service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pricing and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pricing and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-info/10 rounded-xl border border-info/20">
                <p className="font-semibold text-info mb-2">
                  Pricing Subject to Change
                </p>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify our pricing at any time. We will provide 
                  reasonable notice of any price changes to existing subscribers.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All fees are charged in advance for subscription plans</li>
                <li>• Pay-as-you-go credits are non-refundable but do not expire</li>
                <li>• Failed payments may result in service suspension</li>
                <li>• Refunds are handled on a case-by-case basis</li>
                <li>• You are responsible for any applicable taxes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy to understand 
                how we collect, use, and protect your information.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We process your data in accordance with our Privacy Policy</li>
                <li>• You retain ownership of your uploaded data</li>
                <li>• We do not sell or share your data with third parties</li>
                <li>• You can request data deletion at any time</li>
                <li>• We implement security measures to protect your data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="font-semibold text-destructive mb-2">
                  Important Legal Notice
                </p>
                <p className="text-sm text-muted-foreground">
                  ByeByeBots shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, including but not limited to loss of 
                  profits, data, or business opportunities.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Our total liability is limited to the amount you paid for the service</li>
                <li>• We are not responsible for decisions made based on our analysis</li>
                <li>• You use our service at your own risk</li>
                <li>• We provide no warranty of merchantability or fitness for a particular purpose</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Users are responsible for ensuring compliance with local laws and regulations:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• GDPR compliance for EU users</li>
                <li>• CCPA compliance for California users</li>
                <li>• CAN-SPAM Act compliance for US users</li>
                <li>• Other applicable data protection and anti-spam laws</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                ByeByeBots is not responsible for your compliance with local regulations.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Either party may terminate this agreement at any time:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You may cancel your subscription at any time</li>
                <li>• We may suspend or terminate accounts for violations of these terms</li>
                <li>• Upon termination, your access to the service will cease</li>
                <li>• We will retain data as required by law or for legitimate business purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users 
                of significant changes via email or through the service. Continued use of the 
                service after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="font-medium">ByeByeBots.io</p>
                <p className="text-sm text-muted-foreground">Email: legal@byebyebots.io</p>
                <p className="text-sm text-muted-foreground">Website: https://byebyebots.io</p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of 
                [Your Jurisdiction], without regard to its conflict of law provisions. Any 
                disputes arising from these Terms shall be resolved in the courts of 
                [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
