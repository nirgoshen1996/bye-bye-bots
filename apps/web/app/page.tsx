import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Bot,
  Mail,
  Target,
  Clock,
  BarChart3,
  FileText,
  Star,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { AuthNav } from '@/components/auth/auth-nav';
import { Logo } from '@/components/ui/logo';

const features = [
  {
    icon: Bot,
    title: 'Advanced Bot Detection',
    description: 'AI-powered algorithms identify bot accounts with 99%+ accuracy using multiple detection methods.',
    color: 'text-primary'
  },
  {
    icon: Mail,
    title: 'Email Validation',
    description: 'Real-time email verification with syntax checking and MX record validation for maximum deliverability.',
    color: 'text-accent'
  },
  {
    icon: Target,
    title: 'Precise Filtering',
    description: 'Remove disposable emails, role accounts, and suspicious patterns while preserving legitimate users.',
    color: 'text-warning'
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Comprehensive reports with statistics, trends, and insights to optimize your email campaigns.',
    color: 'text-info'
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Process thousands of emails in minutes with our optimized infrastructure and parallel processing.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption. Your data is never stored permanently.',
    color: 'text-accent'
  }
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1,000 emails/month',
      'Basic bot detection',
      'Email validation',
      'CSV processing',
      'Basic support'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      '50,000 emails/month',
      'Advanced bot detection',
      'MX record checking',
      'Priority processing',
      'Email support',
      'API access'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Master',
    price: '$99',
    period: 'per month',
    description: 'For high-volume needs',
    features: [
      '250,000 emails/month',
      'All Pro features',
      'Advanced analytics',
      'Custom rules',
      'Phone support',
      'Dedicated account manager'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const stats = [
  { value: '99.5%', label: 'Detection Accuracy' },
  { value: '10M+', label: 'Emails Processed' },
  { value: '500+', label: 'Happy Customers' },
  { value: '24/7', label: 'Support Available' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <nav className="flex h-16 items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Logo size="lg" animated />
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </nav>
              <AuthNav />
              <ThemeToggle />
            </div>
          </nav>
        </Container>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-20 md:py-32">
          <Container size="lg">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Email Cleaning
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                  Clean Your Email Lists with{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    AI Precision
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Remove bot accounts, disposable emails, and invalid addresses from your CSV files. 
                  Boost deliverability and protect your sender reputation with our advanced detection algorithms.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <Button size="lg" asChild>
                  <Link href="/upload">
                    Start Cleaning Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features for Email List Cleaning
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to maintain clean, deliverable email lists and improve your campaign performance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-soft-lg transition-all duration-200">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs. Start free and scale as you grow.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`h-full relative ${plan.popular ? 'ring-2 ring-primary shadow-soft-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                      <CardDescription className="mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        asChild
                      >
                        <Link href={plan.name === 'Free' ? '/upload' : '/billing'}>
                          {plan.cta}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Clean Your Email Lists?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Join thousands of businesses that trust BotCleaner to maintain their email deliverability.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/upload">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <Container>
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <Logo size="md" />
                <p className="text-sm text-muted-foreground max-w-xs">
                  Professional email list cleaning and bot detection service for businesses.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/upload" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Upload Files
                  </Link>
                  <Link href="/billing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                  <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </div>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Legal</h3>
                <div className="space-y-2">
                  <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="mailto:support@byebyebots.io" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </Link>
                  <Link href="mailto:legal@byebyebots.io" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Legal
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  © 2024 ByeByeBots.io. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Made with ❤️ for clean email lists</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}