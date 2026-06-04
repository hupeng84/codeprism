import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* strategyGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const context = { id: 'context', name: 'PaymentContext', type: 'Context', state: { amount: 100 }, position: { x: 300, y: 50 }, status: 'idle' as const };
  const creditCard = { id: 'cc', name: 'CreditCard', type: 'Strategy', state: { fee: 2.5 }, position: { x: 100, y: 200 }, status: 'idle' as const };
  const paypal = { id: 'pp', name: 'PayPal', type: 'Strategy', state: { fee: 3.0 }, position: { x: 300, y: 200 }, status: 'idle' as const };
  const crypto = { id: 'crypto', name: 'Crypto', type: 'Strategy', state: { fee: 1.0 }, position: { x: 500, y: 200 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [context, creditCard, paypal, crypto], messages: [] }, description: 'Payment system with 3 strategy options', highlightLine: 1 };
  yield { step: 2, state: { objects: [context, creditCard, paypal, crypto], messages: [{ from: 'context', to: 'context', method: 'setStrategy(strategy)', args: ['CreditCard'], status: 'pending' as const }] }, description: 'User selects Credit Card payment', highlightLine: 3 };
  yield { step: 3, state: { objects: [context, { ...creditCard, status: 'active' }, paypal, crypto], messages: [{ from: 'context', to: 'context', method: 'setStrategy(strategy)', args: ['CreditCard'], status: 'complete' as const }] }, description: 'CreditCard strategy is set', highlightLine: 4 };
  yield { step: 4, state: { objects: [context, creditCard, paypal, crypto], messages: [{ from: 'context', to: 'creditCard', method: 'pay(100)', args: [100], status: 'pending' as const }] }, description: 'Processing payment of $100 via Credit Card', highlightLine: 7 };
  yield { step: 5, state: { objects: [{ ...context, status: 'active' }, creditCard, paypal, crypto], messages: [{ from: 'context', to: 'creditCard', method: 'pay(100)', args: [100], status: 'active' as const }] }, description: 'Credit Card fee calculated: $2.50', highlightLine: 8 };
  yield { step: 6, state: { objects: [context, creditCard, paypal, crypto], messages: [{ from: 'context', to: 'context', method: 'setStrategy(strategy)', args: ['PayPal'], status: 'pending' as const }] }, description: 'User switches to PayPal for next payment', highlightLine: 3 };
  yield { step: 7, state: { objects: [context, creditCard, { ...paypal, status: 'active' }, crypto], messages: [{ from: 'context', to: 'context', method: 'setStrategy(strategy)', args: ['PayPal'], status: 'complete' as const }] }, description: 'PayPal strategy is set', highlightLine: 4 };
  yield { step: 8, state: { objects: [context, creditCard, paypal, crypto], messages: [{ from: 'context', to: 'paypal', method: 'pay(100)', args: [100], status: 'pending' as const }] }, description: 'Processing payment via PayPal - fee: $3.00', highlightLine: 14 };
}

export const strategyCode = `interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string) {}

  pay(amount: number): void {
    const fee = amount * 0.025;
    console.log(\`Paid \${amount} with Credit Card. Fee: \${fee}\`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    const fee = amount * 0.03;
    console.log(\`Paid \${amount} with PayPal. Fee: \${fee}\`);
  }
}

class CryptoPayment implements PaymentStrategy {
  constructor(private wallet: string) {}

  pay(amount: number): void {
    const fee = amount * 0.01;
    console.log(\`Paid \${amount} with Crypto. Fee: \${fee}\`);
  }
}

class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  executePayment(amount: number): void {
    this.strategy.pay(amount);
  }
}

// Usage
const creditCard = new CreditCardPayment('1234-5678');
const paypal = new PayPalPayment('user@email.com');
const context = new PaymentContext(creditCard);

context.executePayment(100);
context.setStrategy(paypal);
context.executePayment(100);`;

export const strategyCodeLines = [
  "interface PaymentStrategy {",
  "  pay(amount: number): void;",
  "}",
  "",
  "class CreditCardPayment implements PaymentStrategy {",
  "  constructor(private cardNumber: string) {}",
  "",
  "  pay(amount: number): void {",
  "    const fee = amount * 0.025;",
  "    console.log(`Paid ${amount} with Credit Card. Fee: ${fee}`);",
  "  }",
  "}",
  "",
  "class PayPalPayment implements PaymentStrategy {",
  "  constructor(private email: string) {}",
  "",
  "  pay(amount: number): void {",
  "    const fee = amount * 0.03;",
  "    console.log(`Paid ${amount} with PayPal. Fee: ${fee}`);",
  "  }",
  "}",
  "",
  "class CryptoPayment implements PaymentStrategy {",
  "  constructor(private wallet: string) {}",
  "",
  "  pay(amount: number): void {",
  "    const fee = amount * 0.01;",
  "    console.log(`Paid ${amount} with Crypto. Fee: ${fee}`);",
  "  }",
  "}",
  "",
  "class PaymentContext {",
  "  private strategy: PaymentStrategy;",
  "",
  "  constructor(strategy: PaymentStrategy) {",
  "    this.strategy = strategy;",
  "  }",
  "",
  "  setStrategy(strategy: PaymentStrategy): void {",
  "    this.strategy = strategy;",
  "  }",
  "",
  "  executePayment(amount: number): void {",
  "    this.strategy.pay(amount);",
  "  }",
  "}",
  "",
  "// Usage",
  "const creditCard = new CreditCardPayment('1234-5678');",
  "const paypal = new PayPalPayment('user@email.com');",
  "const context = new PaymentContext(creditCard);",
  "",
  "context.executePayment(100);",
  "context.setStrategy(paypal);",
  "context.executePayment(100);",
];

const strategyDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Context",
      name: "Context",
      attributes: [
        { visibility: "-", name: "strategy", type: "Strategy" },
      ],
      methods: [
        { visibility: "+", name: "executeStrategy", params: "", returnType: "void" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "Strategy",
      name: "Strategy",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 450, y: 50 },
    },
    {
      id: "ConcreteStrategyA",
      name: "ConcreteStrategyA",
      attributes: [],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 100, y: 250 },
    },
    {
      id: "ConcreteStrategyB",
      name: "ConcreteStrategyB",
      attributes: [],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 350, y: 250 },
    },
    {
      id: "ConcreteStrategyC",
      name: "ConcreteStrategyC",
      attributes: [],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 600, y: 250 },
    },
  ],
  relationships: [
    { from: "ConcreteStrategyA", to: "Strategy", type: "implements" },
    { from: "ConcreteStrategyB", to: "Strategy", type: "implements" },
    { from: "ConcreteStrategyC", to: "Strategy", type: "implements" },
    { from: "Context", to: "Strategy", type: "association", label: "has" },
  ],
};

export const strategyContent = {
  id: "strategy",
  slug: "strategy",
  title: "",
  titleKey: "content.patterns.strategy.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.strategy.desc",
  defaultInput: undefined,
  code: strategyCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  diagram: strategyDiagram,
  icon: "🎯",
  codeExamples: {
    typescript: {
      code: `interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string) {}
  pay(amount: number): void {
    const fee = amount * 0.025;
    console.log(\`Paid \${amount} with Credit Card. Fee: \${fee}\`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}
  pay(amount: number): void {
    const fee = amount * 0.03;
    console.log(\`Paid \${amount} with PayPal. Fee: \${fee}\`);
  }
}

class PaymentContext {
  private strategy: PaymentStrategy;
  constructor(strategy: PaymentStrategy) { this.strategy = strategy; }
  setStrategy(strategy: PaymentStrategy): void { this.strategy = strategy; }
  executePayment(amount: number): void { this.strategy.pay(amount); }
}

const creditCard = new CreditCardPayment('1234-5678');
const paypal = new PayPalPayment('user@email.com');
const context = new PaymentContext(creditCard);
context.executePayment(100);
context.setStrategy(paypal);
context.executePayment(100);`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef void (*PayFunc)(double);

typedef struct {
  PayFunc pay;
} PaymentStrategy;

void credit_card_pay(double amount) {
  printf("Paid %.2f with Credit Card. Fee: %.2f\\n", amount, amount * 0.025);
}

void paypal_pay(double amount) {
  printf("Paid %.2f with PayPal. Fee: %.2f\\n", amount, amount * 0.03);
}

int main(void) {
  PaymentStrategy s = { credit_card_pay };
  s.pay(100.0);
  s.pay = paypal_pay;
  s.pay(100.0);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

class PaymentStrategy {
public:
  virtual void pay(double amount) = 0;
  virtual ~PaymentStrategy() = default;
};

class CreditCardPayment : public PaymentStrategy {
  std::string cardNumber;
public:
  CreditCardPayment(const std::string& c) : cardNumber(c) {}
  void pay(double amount) override {
    std::cout << "Paid " << amount << " with Credit Card. Fee: " << amount * 0.025 << "\\n";
  }
};

class PayPalPayment : public PaymentStrategy {
  std::string email;
public:
  PayPalPayment(const std::string& e) : email(e) {}
  void pay(double amount) override {
    std::cout << "Paid " << amount << " with PayPal. Fee: " << amount * 0.03 << "\\n";
  }
};

class PaymentContext {
  std::unique_ptr<PaymentStrategy> strategy;
public:
  PaymentContext(std::unique_ptr<PaymentStrategy> s) : strategy(std::move(s)) {}
  void setStrategy(std::unique_ptr<PaymentStrategy> s) { strategy = std::move(s); }
  void executePayment(double amount) { strategy->pay(amount); }
};

int main() {
  auto context = std::make_unique<PaymentContext>(std::make_unique<CreditCardPayment>("1234"));
  context->executePayment(100);
  context->setStrategy(std::make_unique<PayPalPayment>("user@email.com"));
  context->executePayment(100);
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number):
        self.card_number = card_number

    def pay(self, amount):
        fee = amount * 0.025
        print(f"Paid {amount} with Credit Card. Fee: {fee}")

class PayPalPayment(PaymentStrategy):
    def __init__(self, email):
        self.email = email

    def pay(self, amount):
        fee = amount * 0.03
        print(f"Paid {amount} with PayPal. Fee: {fee}")

class PaymentContext:
    def __init__(self, strategy):
        self.strategy = strategy

    def set_strategy(self, strategy):
        self.strategy = strategy

    def execute_payment(self, amount):
        self.strategy.pay(amount)

credit_card = CreditCardPayment('1234-5678')
paypal = PayPalPayment('user@email.com')
context = PaymentContext(credit_card)
context.execute_payment(100)
context.set_strategy(paypal)
context.execute_payment(100)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait PaymentStrategy {
    fn pay(&self, amount: f64);
}

struct CreditCardPayment;
struct PayPalPayment;

impl PaymentStrategy for CreditCardPayment {
    fn pay(&self, amount: f64) {
        println!("Paid {} with Credit Card. Fee: {}", amount, amount * 0.025);
    }
}

impl PaymentStrategy for PayPalPayment {
    fn pay(&self, amount: f64) {
        println!("Paid {} with PayPal. Fee: {}", amount, amount * 0.03);
    }
}

struct PaymentContext<'a> {
    strategy: &'a dyn PaymentStrategy,
}

impl<'a> PaymentContext<'a> {
    fn new(strategy: &'a dyn PaymentStrategy) -> Self { PaymentContext { strategy } }
    fn set_strategy(&mut self, s: &'a dyn PaymentStrategy) { self.strategy = s; }
    fn execute_payment(&self, amount: f64) { self.strategy.pay(amount); }
}

fn main() {
    let cc = CreditCardPayment;
    let pp = PayPalPayment;
    let mut context = PaymentContext::new(&cc);
    context.execute_payment(100.0);
    context.set_strategy(&pp);
    context.execute_payment(100.0);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type PaymentStrategy interface {
    Pay(amount float64)
}

type CreditCardPayment struct{}
func (CreditCardPayment) Pay(amount float64) {
    fmt.Printf("Paid %.2f with Credit Card. Fee: %.2f\\n", amount, amount * 0.025)
}

type PayPalPayment struct{}
func (PayPalPayment) Pay(amount float64) {
    fmt.Printf("Paid %.2f with PayPal. Fee: %.2f\\n", amount, amount * 0.03)
}

type PaymentContext struct {
    strategy PaymentStrategy
}

func NewPaymentContext(s PaymentStrategy) *PaymentContext {
    return &PaymentContext{strategy: s}
}

func (c *PaymentContext) SetStrategy(s PaymentStrategy) { c.strategy = s }
func (c *PaymentContext) ExecutePayment(amount float64) { c.strategy.Pay(amount) }

func main() {
    ctx := NewPaymentContext(CreditCardPayment{})
    ctx.ExecutePayment(100)
    ctx.SetStrategy(PayPalPayment{})
    ctx.ExecutePayment(100)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Main {
    interface PaymentStrategy {
        void pay(double amount);
    }

    static class CreditCardPayment implements PaymentStrategy {
        private String cardNumber;
        public CreditCardPayment(String cardNumber) { this.cardNumber = cardNumber; }
        public void pay(double amount) {
            double fee = amount * 0.025;
            System.out.printf("Paid %.2f with Credit Card. Fee: %.2f%n", amount, fee);
        }
    }

    static class PayPalPayment implements PaymentStrategy {
        private String email;
        public PayPalPayment(String email) { this.email = email; }
        public void pay(double amount) {
            double fee = amount * 0.03;
            System.out.printf("Paid %.2f with PayPal. Fee: %.2f%n", amount, fee);
        }
    }

    static class PaymentContext {
        private PaymentStrategy strategy;
        public PaymentContext(PaymentStrategy s) { this.strategy = s; }
        public void setStrategy(PaymentStrategy s) { this.strategy = s; }
        public void executePayment(double amount) { strategy.pay(amount); }
    }

    public static void main(String[] args) {
        PaymentContext ctx = new PaymentContext(new CreditCardPayment("1234"));
        ctx.executePayment(100);
        ctx.setStrategy(new PayPalPayment("user@email.com"));
        ctx.executePayment(100);
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — shows how interchangeable algorithms
  // power everyday infrastructure.
  scenarios: [
    {
      id: "java-comparator",
      i18nKey: "content.patterns.strategy.scenarios.java-comparator",
      domain: "library",
      icon: "☕",
      reference: "Java SDK, Python sorted, Go sort.Interface",
      codeSnippet: {
        language: "java",
        code: `// Java Comparator — interchangeable sorting strategies
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// Strategy 1: natural order
Collections.sort(names);

// Strategy 2: custom comparator (reverse length)
Comparator<String> byLength = (a, b) ->
  Integer.compare(b.length(), a.length());
names.sort(byLength);`,
      },
    },
    {
      id: "http-compression",
      i18nKey: "content.patterns.strategy.scenarios.http-compression",
      domain: "network",
      icon: "🚀",
      reference: "nginx, Cloudflare, Node.js zlib",
    },
  ] satisfies Scenario[],
};
