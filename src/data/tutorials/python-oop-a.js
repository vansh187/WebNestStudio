// Python course — object-oriented programming lessons (part 1).
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonOopA = {
  'classes-and-objects': {
    title: 'Classes and Objects in Python',
    intro: `Object-oriented programming (OOP) organises code around <strong>objects</strong> that bundle data (attributes) and behaviour (methods). A <strong>class</strong> is the blueprint; an <strong>object</strong> (or instance) is a concrete thing built from it. A <code>BankAccount</code> class describes what every account has and can do; each customer's account is an object.

This lesson covers defining classes, creating objects, instance attributes and methods, the <code>self</code> parameter, class attributes, and how objects are identified and compared.`,
    sections: [
      {
        heading: 'Defining a Class and Creating Objects',
        body: `Use the <code>class</code> keyword and PascalCase names. Calling the class like a function — <code>Account("Asha")</code> — creates a new object, runs its <code>__init__</code> method, and returns the object. Each object has its own attributes, stored in its <code>__dict__</code>.`,
      },
      {
        heading: 'self and Methods',
        body: `A method is a function defined inside a class. Its first parameter, conventionally named <code>self</code>, is the object the method was called on: <code>account.deposit(500)</code> is really <code>Account.deposit(account, 500)</code>. Through <code>self</code>, methods read and change the object's attributes.`,
      },
      {
        heading: 'Class Attributes vs Instance Attributes',
        body: `Attributes assigned on <code>self</code> belong to one object. Attributes assigned in the class body are shared by all instances — useful for constants and counters. Reading <code>obj.attr</code> looks in the instance first, then the class. Assigning <code>obj.attr = ...</code> always creates an instance attribute, which can shadow the class attribute.`,
      },
      {
        heading: 'Identity, Equality and Printing',
        body: `Two separate objects with the same data are not the same object: <code>is</code> compares identity, and by default <code>==</code> does too — until you define <code>__eq__</code>. Printing an object shows something like <code>&lt;__main__.Account object at 0x...&gt;</code> until you define <code>__str__</code> or <code>__repr__</code> (see the magic methods lesson).`,
      },
    ],
    examples: [
      {
        caption: 'A class with attributes and methods',
        code: `class BankAccount:
    bank_name = "Webnest Bank"          # class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner              # instance attributes
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            print(f"Insufficient funds for {self.owner}")
            return self.balance
        self.balance -= amount
        return self.balance


asha = BankAccount("Asha", 1000)
ravi = BankAccount("Ravi")
asha.deposit(500)
asha.withdraw(200)
ravi.withdraw(50)
print(asha.owner, asha.balance, "|", ravi.owner, ravi.balance)
print(asha.bank_name, BankAccount.bank_name)
print(asha.__dict__)`,
        output: `Insufficient funds for Ravi
Asha 1300 | Ravi 0
Webnest Bank Webnest Bank
{'owner': 'Asha', 'balance': 1300}`,
      },
      {
        caption: 'self is just the object: method call equivalence',
        code: `class Greeter:
    def __init__(self, name):
        self.name = name

    def greet(self, greeting):
        return f"{greeting}, {self.name}!"

g = Greeter("Meera")
print(g.greet("Hello"))
print(Greeter.greet(g, "Namaste"))     # the same call, spelled out`,
        output: `Hello, Meera!
Namaste, Meera!`,
      },
      {
        caption: 'Class attributes as shared state, and shadowing',
        code: `class Student:
    school = "Webnest Academy"
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count += 1

a, b = Student("Asha"), Student("Ravi")
print(Student.count, a.school)

b.school = "Other School"        # creates an instance attribute on b only
print(a.school, "|", b.school, "|", Student.school)
print("school" in vars(a), "school" in vars(b))`,
        output: `2 Webnest Academy
Webnest Academy | Other School | Webnest Academy
False True`,
      },
      {
        caption: 'Identity and equality of objects',
        code: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

p1, p2 = Point(1, 2), Point(1, 2)
p3 = p1
print(p1 is p2, p1 == p2, p1 is p3)
print(isinstance(p1, Point), type(p1).__name__)`,
        output: `False False True
True Point`,
      },
    ],
    commonMistakes: [
      'Forgetting self as the first method parameter (TypeError: takes 0 positional arguments but 1 was given).',
      'Using a mutable class attribute (items = []) that every instance accidentally shares.',
      'Writing count += 1 on self instead of the class, creating an instance attribute.',
      'Expecting == to compare object contents without defining __eq__.',
    ],
    keyPoints: [
      'A class is a blueprint; calling it creates an object and runs __init__.',
      'Methods receive the object as self; attributes set on self belong to that object.',
      'Class attributes are shared; instance attributes shadow them.',
      'is compares identity; == compares identity too unless __eq__ is defined.',
    ],
  },

  'constructors-and-the-init-method': {
    title: 'Constructors and the __init__ Method',
    intro: `When you create an object, Python calls special methods to build it: <code>__new__</code> creates the object and <code>__init__</code> initialises its attributes. <code>__init__</code> is what most people call the "constructor". It is where you set starting values, validate arguments, and establish the invariants the rest of the class relies on.

This lesson covers <code>__init__</code> with required and default parameters, validation, alternative constructors with <code>@classmethod</code>, calling a parent's constructor with <code>super()</code>, <code>__new__</code> for special cases, and the destructor <code>__del__</code>.`,
    sections: [
      {
        heading: 'The __init__ Method',
        body: `<code>__init__(self, ...)</code> runs automatically after the object is created. It should set every attribute the object needs, so objects are never half-initialised. It must return <code>None</code>. Python does not support multiple constructors by overloading; use default arguments or alternative constructors instead.`,
      },
      {
        heading: 'Validation in the Constructor',
        body: `Checking arguments in <code>__init__</code> and raising <code>ValueError</code> or <code>TypeError</code> for bad input means an invalid object can never exist. It is far easier to debug an error at creation time than a wrong value discovered much later.`,
      },
      {
        heading: 'Alternative Constructors',
        body: `A <code>@classmethod</code> that returns <code>cls(...)</code> gives a class several named ways to be created: <code>Date.from_string("2026-09-27")</code>, <code>User.from_dict(data)</code>. This is Python's answer to constructor overloading and keeps <code>__init__</code> simple.`,
      },
      {
        heading: '__new__ and __del__',
        body: `<code>__new__(cls, ...)</code> actually allocates the object; override it only for immutable subclasses (like subclasses of <code>str</code> or <code>tuple</code>) or patterns such as singletons. <code>__del__</code> runs when an object is garbage-collected, but the timing is not guaranteed — use context managers (<code>with</code>) for reliable cleanup.`,
      },
    ],
    examples: [
      {
        caption: 'A constructor with defaults and validation',
        code: `class Product:
    def __init__(self, name, price, quantity=0):
        if not name:
            raise ValueError("name is required")
        if price < 0:
            raise ValueError("price cannot be negative")
        self.name = name
        self.price = price
        self.quantity = quantity

    def total(self):
        return self.price * self.quantity

pen = Product("Pen", 10, 5)
book = Product("Book", 250)
print(pen.total(), book.quantity)

for args in [("", 10), ("Bag", -5)]:
    try:
        Product(*args)
    except ValueError as e:
        print("ValueError:", e)`,
        output: `50 0
ValueError: name is required
ValueError: price cannot be negative`,
      },
      {
        caption: 'Alternative constructors with @classmethod',
        code: `class Student:
    def __init__(self, name, age, city):
        self.name, self.age, self.city = name, age, city

    @classmethod
    def from_csv(cls, line):
        name, age, city = line.split(",")
        return cls(name.strip(), int(age), city.strip())

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data.get("age", 0), data.get("city", "Unknown"))

    def __repr__(self):
        return f"Student({self.name!r}, {self.age}, {self.city!r})"

print(Student("Asha", 24, "Pune"))
print(Student.from_csv("Ravi, 30, Delhi"))
print(Student.from_dict({"name": "Meera"}))`,
        output: `Student('Asha', 24, 'Pune')
Student('Ravi', 30, 'Delhi')
Student('Meera', 0, 'Unknown')`,
      },
      {
        caption: 'Calling the parent constructor with super()',
        code: `class Person:
    def __init__(self, name):
        self.name = name

class Employee(Person):
    def __init__(self, name, salary):
        super().__init__(name)          # let Person initialise its part
        self.salary = salary

e = Employee("Kiran", 50000)
print(e.name, e.salary)`,
        output: `Kiran 50000`,
      },
      {
        caption: '__new__ for a singleton and __del__',
        code: `class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print("creating the single Config")
            cls._instance = super().__new__(cls)
        return cls._instance

a, b = Config(), Config()
print(a is b)

class TempFile:
    def __init__(self, name):
        self.name = name
        print("open", name)
    def __del__(self):
        print("cleanup", self.name)

t = TempFile("report.tmp")
del t
print("done")`,
        output: `creating the single Config
True
open report.tmp
cleanup report.tmp
done`,
      },
    ],
    commonMistakes: [
      'Misspelling __init__ (e.g. _init_ or __int__), so it never runs.',
      'Returning a value from __init__ (TypeError).',
      'Defining two __init__ methods expecting overloading — the second replaces the first.',
      'Forgetting super().__init__() in a subclass, leaving parent attributes unset.',
      'Relying on __del__ for important cleanup instead of context managers.',
    ],
    keyPoints: [
      '__init__ initialises a new object; __new__ creates it.',
      'Validate arguments in __init__ so invalid objects never exist.',
      'Use @classmethod alternative constructors instead of overloading.',
      'Call super().__init__() in subclasses.',
      'Prefer context managers over __del__ for cleanup.',
    ],
  },

  'instance-class-and-static-methods': {
    title: 'Instance, Class and Static Methods',
    intro: `Python classes can contain three kinds of methods, distinguished by what they receive as their first argument. <strong>Instance methods</strong> receive the object (<code>self</code>), <strong>class methods</strong> receive the class (<code>cls</code>), and <strong>static methods</strong> receive nothing special. Choosing the right kind makes a class's design clearer.

This lesson explains each type, when to use it, and how they behave with inheritance.`,
    sections: [
      {
        heading: 'Instance Methods',
        body: `The default. They work with a particular object's data through <code>self</code> and can also reach the class through <code>self.__class__</code>. Most methods are instance methods: <code>account.deposit()</code>, <code>order.total()</code>.`,
      },
      {
        heading: 'Class Methods',
        body: `Decorated with <code>@classmethod</code>, they receive the class as <code>cls</code>. Use them for alternative constructors and for working with class-level state. Because <code>cls</code> is the class the method was called on, a subclass calling an inherited class method gets instances of the subclass — they are inheritance-friendly.`,
      },
      {
        heading: 'Static Methods',
        body: `Decorated with <code>@staticmethod</code>, they receive neither the object nor the class. They are ordinary functions placed inside the class because they logically belong there — validation helpers, unit conversions. If a helper does not relate to the class at all, a module-level function is usually better.`,
      },
    ],
    examples: [
      {
        caption: 'All three method types in one class',
        code: `class Temperature:
    unit_label = "°C"
    readings = 0

    def __init__(self, celsius):
        self.celsius = celsius
        Temperature.readings += 1

    def to_fahrenheit(self):                    # instance method
        return self.celsius * 9 / 5 + 32

    @classmethod
    def from_fahrenheit(cls, fahrenheit):       # class method
        return cls(round((fahrenheit - 32) * 5 / 9, 1))

    @classmethod
    def total_readings(cls):
        return cls.readings

    @staticmethod
    def is_valid(celsius):                      # static method
        return celsius >= -273.15

t = Temperature(25)
print(t.to_fahrenheit())
print(Temperature.from_fahrenheit(98.6).celsius)
print(Temperature.is_valid(-300), Temperature.is_valid(10))
print(Temperature.total_readings())`,
        output: `77.0
37.0
False True
2`,
      },
      {
        caption: 'Class methods respect inheritance; static methods do not know the class',
        code: `class Shape:
    def __init__(self, size):
        self.size = size

    @classmethod
    def unit(cls):
        return cls(1)

    @staticmethod
    def describe():
        return "a shape"

class Square(Shape):
    def area(self):
        return self.size ** 2

s = Square.unit()                  # cls is Square, so we get a Square
print(type(s).__name__, s.area(), Square.describe())`,
        output: `Square 1 a shape`,
      },
    ],
    commonMistakes: [
      'Forgetting @classmethod or @staticmethod, so Python passes self unexpectedly.',
      'Using a static method for a factory, which then always creates the base class instead of subclasses.',
      'Putting unrelated utility functions inside classes as static methods.',
      'Modifying class state through self (self.count += 1) instead of cls or the class name.',
    ],
    keyPoints: [
      'Instance methods get self and work with object data.',
      '@classmethod methods get cls; ideal for factories and class state.',
      '@staticmethod methods get neither; they are namespaced helper functions.',
      'Class methods create the correct subclass when inherited.',
    ],
  },

  inheritance: {
    title: 'Inheritance in Python',
    intro: `Inheritance lets a new class reuse and extend an existing one. A <code>SavingsAccount</code> is a <code>BankAccount</code> with interest; an <code>Admin</code> is a <code>User</code> with extra permissions. The new class (child, subclass) inherits the attributes and methods of the existing class (parent, base, superclass) and can add or override behaviour.

This lesson covers single, multilevel, hierarchical and multiple inheritance, <code>super()</code>, method overriding, the Method Resolution Order (MRO), <code>isinstance</code>/<code>issubclass</code>, and mixins.`,
    sections: [
      {
        heading: 'Single Inheritance and Overriding',
        body: `<code>class Child(Parent):</code> creates a subclass. The child inherits everything; defining a method with the same name <strong>overrides</strong> the parent's. Inside the override, <code>super().method()</code> calls the parent version so you extend rather than replace behaviour. Every class ultimately inherits from <code>object</code>.`,
      },
      {
        heading: 'Types of Inheritance',
        body: `The common structures:`,
        list: [
          '<strong>Single</strong> — one parent: <code>Dog(Animal)</code>.',
          '<strong>Multilevel</strong> — a chain: <code>Puppy(Dog)</code>, <code>Dog(Animal)</code>.',
          '<strong>Hierarchical</strong> — several children of one parent: <code>Dog(Animal)</code>, <code>Cat(Animal)</code>.',
          '<strong>Multiple</strong> — several parents: <code>FlyingCar(Car, Aircraft)</code>.',
          '<strong>Hybrid</strong> — a combination of the above.',
        ],
      },
      {
        heading: 'Multiple Inheritance and the MRO',
        body: `With several parents, Python searches for attributes in the <strong>Method Resolution Order</strong>, computed by the C3 linearisation algorithm and visible in <code>Class.__mro__</code> or <code>Class.mro()</code>. <code>super()</code> follows the MRO, not simply "the parent", which lets cooperative classes each run once even in diamond-shaped hierarchies.`,
      },
      {
        heading: 'Mixins',
        body: `A mixin is a small class that adds one capability (serialisation to JSON, logging, comparison) and is designed to be combined with others through multiple inheritance: <code>class Order(JsonMixin, TimestampMixin, Model)</code>. Mixins should not have their own <code>__init__</code> state requirements.`,
      },
    ],
    examples: [
      {
        caption: 'Single inheritance, overriding and super()',
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance

    def describe(self):
        return f"{self.owner}: Rs.{self.balance}"

    def month_end(self):
        pass

class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, rate=0.04):
        super().__init__(owner, balance)
        self.rate = rate

    def month_end(self):                       # override
        self.balance += round(self.balance * self.rate / 12, 2)

    def describe(self):                        # extend
        return super().describe() + f" (savings @ {self.rate:.0%})"

acc = SavingsAccount("Asha", 12000)
acc.month_end()
print(acc.describe())
print(isinstance(acc, BankAccount), issubclass(SavingsAccount, BankAccount))`,
        output: `Asha: Rs.12040.0 (savings @ 4%)
True True`,
      },
      {
        caption: 'Multilevel and hierarchical inheritance',
        code: `class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."
    def intro(self):
        return f"{self.name} says {self.speak()}"

class Dog(Animal):
    def speak(self):
        return "Woof"

class Puppy(Dog):
    def speak(self):
        return super().speak() + " (tiny)"

class Cat(Animal):
    def speak(self):
        return "Meow"

for pet in [Dog("Rex"), Puppy("Bolt"), Cat("Tom"), Animal("Generic")]:
    print(pet.intro())
print([c.__name__ for c in Puppy.__mro__])`,
        output: `Rex says Woof
Bolt says Woof (tiny)
Tom says Meow
Generic says ...
['Puppy', 'Dog', 'Animal', 'object']`,
      },
      {
        caption: 'Multiple inheritance, the diamond and the MRO',
        code: `class Base:
    def setup(self):
        print("Base.setup")

class Logging(Base):
    def setup(self):
        print("Logging.setup")
        super().setup()

class Caching(Base):
    def setup(self):
        print("Caching.setup")
        super().setup()

class Service(Logging, Caching):
    def setup(self):
        print("Service.setup")
        super().setup()

Service().setup()
print([c.__name__ for c in Service.mro()])`,
        output: `Service.setup
Logging.setup
Caching.setup
Base.setup
['Service', 'Logging', 'Caching', 'Base', 'object']`,
      },
      {
        caption: 'A mixin adding JSON serialisation',
        code: `import json

class JsonMixin:
    def to_json(self):
        return json.dumps(vars(self), sort_keys=True)

class Course:
    def __init__(self, title, lessons):
        self.title, self.lessons = title, lessons

class PublishedCourse(JsonMixin, Course):
    pass

print(PublishedCourse("Python", 130).to_json())`,
        output: `{"lessons": 130, "title": "Python"}`,
      },
    ],
    commonMistakes: [
      'Forgetting to call super().__init__() in a subclass constructor.',
      'Calling Parent.method(self) directly in multiple inheritance, which can run a base class twice; use super().',
      'Deep inheritance hierarchies that are hard to follow — prefer composition for "has-a" relationships.',
      'Inheriting just to reuse one helper method.',
    ],
    keyPoints: [
      'class Child(Parent) inherits attributes and methods; overriding replaces them.',
      'super() calls the next class in the MRO, letting you extend behaviour.',
      'Python supports single, multilevel, hierarchical, multiple and hybrid inheritance.',
      'The MRO (Class.__mro__) defines lookup order in multiple inheritance.',
      'Mixins add focused capabilities through multiple inheritance.',
    ],
  },

  'polymorphism-and-method-overriding': {
    title: 'Polymorphism and Method Overriding',
    intro: `Polymorphism means "many forms": the same operation works on different types, each doing the right thing for itself. <code>len()</code> works on strings, lists and dicts; <code>shape.area()</code> computes a circle's or a rectangle's area. Code written against the shared interface works with every type that provides it, including types created later.

This lesson covers polymorphism through inheritance and overriding, duck typing (Python's most common form), operator polymorphism, and <code>typing.Protocol</code> for type-checked duck typing.`,
    sections: [
      {
        heading: 'Polymorphism Through Overriding',
        body: `Subclasses override a method defined by a base class; code that calls the method on the base type automatically uses each subclass's version at runtime. A payment system can loop over <code>CardPayment</code>, <code>UpiPayment</code> and <code>WalletPayment</code> objects calling <code>pay()</code> without checking types.`,
      },
      {
        heading: 'Duck Typing',
        body: `"If it walks like a duck and quacks like a duck, it's a duck." Python does not require a common base class: any object with the needed method works. File-like objects, iterables and context managers are all duck-typed protocols. Write functions that rely on behaviour, not on <code>type()</code> checks.`,
      },
      {
        heading: 'Built-in and Operator Polymorphism',
        body: `<code>+</code> adds numbers, concatenates strings and lists, and can be defined for your own classes via <code>__add__</code>. Built-ins like <code>len()</code>, <code>str()</code>, <code>iter()</code> call special methods (<code>__len__</code>, <code>__str__</code>, <code>__iter__</code>), so your classes can join in.`,
      },
      {
        heading: 'Protocols',
        body: `<code>typing.Protocol</code> describes an interface structurally: any class with matching methods satisfies it, without inheriting from it. Static type checkers such as mypy then verify duck-typed code; with <code>@runtime_checkable</code> you can also use <code>isinstance</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Polymorphism through a common base class',
        code: `import math

class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return math.pi * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

class Triangle(Shape):
    def __init__(self, b, h):
        self.b, self.h = b, h
    def area(self):
        return 0.5 * self.b * self.h

shapes = [Circle(1), Rectangle(3, 4), Triangle(6, 2)]
for s in shapes:
    print(f"{type(s).__name__:<10} {s.area():.2f}")
print("total:", round(sum(s.area() for s in shapes), 2))`,
        output: `Circle     3.14
Rectangle  12.00
Triangle   6.00
total: 21.14`,
      },
      {
        caption: 'Duck typing: no shared base class needed',
        code: `class UpiPayment:
    def pay(self, amount):
        return f"Paid Rs.{amount} via UPI"

class CardPayment:
    def pay(self, amount):
        return f"Charged Rs.{amount} to card"

class GiftVoucher:
    def pay(self, amount):
        return f"Redeemed voucher for Rs.{amount}"

def checkout(method, amount):
    return method.pay(amount)          # works for anything with pay()

for m in [UpiPayment(), CardPayment(), GiftVoucher()]:
    print(checkout(m, 499))`,
        output: `Paid Rs.499 via UPI
Charged Rs.499 to card
Redeemed voucher for Rs.499`,
      },
      {
        caption: 'Operator and built-in polymorphism',
        code: `print(2 + 3, "py" + "thon", [1] + [2], (1,) + (2,))
print(len("hello"), len([1, 2]), len({"a": 1}))

class Playlist:
    def __init__(self, songs):
        self.songs = songs
    def __len__(self):
        return len(self.songs)
    def __add__(self, other):
        return Playlist(self.songs + other.songs)

mix = Playlist(["a", "b"]) + Playlist(["c"])
print(len(mix), mix.songs)`,
        output: `5 python [1, 2] (1, 2)
5 2 1
3 ['a', 'b', 'c']`,
      },
      {
        caption: 'Structural typing with Protocol',
        code: `from typing import Protocol, runtime_checkable

@runtime_checkable
class Notifier(Protocol):
    def send(self, message: str) -> str: ...

class EmailNotifier:
    def send(self, message: str) -> str:
        return f"email: {message}"

class SmsNotifier:
    def send(self, message: str) -> str:
        return f"sms: {message}"

class Logger:
    def log(self, message: str) -> None: ...

def alert(n: Notifier, message: str) -> str:
    return n.send(message)

print(alert(EmailNotifier(), "Order shipped"), "|", alert(SmsNotifier(), "OTP 4821"))
print(isinstance(EmailNotifier(), Notifier), isinstance(Logger(), Notifier))`,
        output: `email: Order shipped | sms: OTP 4821
True False`,
      },
    ],
    commonMistakes: [
      'Writing if type(x) == A ... elif type(x) == B chains instead of calling a polymorphic method.',
      'Overriding a method with an incompatible signature, breaking callers.',
      'Forcing inheritance where duck typing or a Protocol is enough.',
      'Returning different types from overrides of the same method.',
    ],
    keyPoints: [
      'Polymorphism lets one interface work with many types.',
      'Overriding in subclasses gives type-specific behaviour behind a common method.',
      'Duck typing: objects are usable if they have the needed methods.',
      'Operators and built-ins are polymorphic through special methods.',
      'typing.Protocol type-checks duck-typed interfaces.',
    ],
  },

  'method-overloading-in-python': {
    title: 'Method Overloading in Python',
    intro: `In Java or C++, method overloading means defining several methods with the same name but different parameter lists, and the compiler picks one based on the arguments. Python does not support this directly: a later definition with the same name simply replaces the earlier one.

This lesson shows what happens if you try, and the Pythonic ways to get the same flexibility: default and variable arguments, type-based dispatch with <code>functools.singledispatch</code> and <code>singledispatchmethod</code>, alternative constructors, and <code>typing.overload</code> for type checkers.`,
    sections: [
      {
        heading: 'Why Classic Overloading Does Not Work',
        body: `A class body is executed like normal code: <code>def area(self, r)</code> followed by <code>def area(self, w, h)</code> binds the name <code>area</code> twice, and only the last function survives. Calling it with one argument then raises <code>TypeError</code>.`,
      },
      {
        heading: 'Default Arguments and *args',
        body: `Most overloading needs are met with optional parameters: <code>def area(self, a, b=None)</code> computes a square when <code>b</code> is missing and a rectangle otherwise. <code>*args</code> and <code>**kwargs</code> handle a variable number of arguments.`,
      },
      {
        heading: 'Dispatch on Type',
        body: `<code>functools.singledispatch</code> turns a function into a generic function whose implementation is chosen by the type of the first argument; register implementations with <code>@func.register</code>. For methods, <code>functools.singledispatchmethod</code> dispatches on the first argument after <code>self</code>.`,
      },
      {
        heading: 'typing.overload',
        body: `<code>@typing.overload</code> declares several signatures for type checkers and IDEs, followed by one real implementation. It documents the accepted combinations but performs no runtime dispatch.`,
      },
    ],
    examples: [
      {
        caption: 'The last definition wins',
        code: `class Calculator:
    def add(self, a, b):
        return a + b

    def add(self, a, b, c):          # replaces the first add
        return a + b + c

calc = Calculator()
print(calc.add(1, 2, 3))
try:
    calc.add(1, 2)
except TypeError as e:
    print("TypeError:", e)`,
        output: `6
TypeError: Calculator.add() missing 1 required positional argument: 'c'`,
      },
      {
        caption: 'Overloading with default arguments and *args',
        code: `class Calculator:
    def add(self, *numbers):
        return sum(numbers)

    def area(self, a, b=None):
        return a * a if b is None else a * b

calc = Calculator()
print(calc.add(1, 2), calc.add(1, 2, 3, 4))
print(calc.area(5), calc.area(4, 6))`,
        output: `3 10
25 24`,
      },
      {
        caption: 'Type-based dispatch with singledispatch and singledispatchmethod',
        code: `from functools import singledispatch, singledispatchmethod

@singledispatch
def describe(value):
    return f"something: {value!r}"

@describe.register
def _(value: int):
    return f"integer with {len(str(abs(value)))} digits"

@describe.register
def _(value: list):
    return f"list of {len(value)} items"

print(describe(12345), "|", describe([1, 2]), "|", describe(3.5))

class Formatter:
    @singledispatchmethod
    def format(self, value):
        return str(value)

    @format.register
    def _(self, value: float):
        return f"{value:.2f}"

    @format.register
    def _(self, value: dict):
        return ", ".join(f"{k}={v}" for k, v in value.items())

f = Formatter()
print(f.format(7), f.format(3.14159), f.format({"a": 1, "b": 2}))`,
        output: `integer with 5 digits | list of 2 items | something: 3.5
7 3.14 a=1, b=2`,
      },
      {
        caption: 'typing.overload for precise type hints',
        code: `from typing import overload

@overload
def parse(value: str) -> int: ...
@overload
def parse(value: bytes) -> str: ...

def parse(value):
    if isinstance(value, bytes):
        return value.decode()
    return int(value)

print(parse("42") + 1, parse(b"hello").upper())`,
        output: `43 HELLO`,
      },
    ],
    commonMistakes: [
      'Defining several methods with the same name expecting Java-style overloading.',
      'Writing long isinstance chains where singledispatch would be clearer.',
      'Expecting typing.overload to dispatch at runtime — it only informs type checkers.',
      'Using *args everywhere so the function signature no longer documents its inputs.',
    ],
    keyPoints: [
      'Python keeps only the last definition of a name; there is no classic overloading.',
      'Default arguments and *args/**kwargs cover most overloading needs.',
      'functools.singledispatch / singledispatchmethod dispatch on argument type.',
      'Alternative constructors (@classmethod) replace constructor overloading.',
      'typing.overload documents multiple signatures for type checkers.',
    ],
  },

  'encapsulation-and-access-modifiers': {
    title: 'Encapsulation and Access Modifiers in Python',
    intro: `Encapsulation means bundling data with the methods that operate on it and hiding internal details behind a clear interface. A bank account should not let anyone set its balance to any value; changes should go through <code>deposit()</code> and <code>withdraw()</code>, which enforce the rules.

Python has no <code>private</code> or <code>protected</code> keywords. Instead it uses naming conventions — public names, <code>_protected</code> names and <code>__private</code> names with name mangling — together with properties. This lesson explains all three levels and how to design well-encapsulated classes.`,
    sections: [
      {
        heading: 'Public, Protected and Private by Convention',
        body: `The three levels:`,
        list: [
          '<strong>Public</strong> — <code>name</code>: part of the class\'s interface; anyone may use it.',
          '<strong>Protected</strong> — <code>_name</code>: "internal, please don\'t touch from outside"; subclasses may use it. Nothing stops access — it is a convention every Python developer respects. <code>from module import *</code> also skips such names.',
          '<strong>Private</strong> — <code>__name</code>: Python <em>name-mangles</em> it to <code>_ClassName__name</code>, preventing accidental access and name clashes in subclasses. It is still reachable through the mangled name, so it is not true security.',
        ],
      },
      {
        heading: 'Controlled Access with Methods and Properties',
        body: `Expose behaviour, not raw data: methods validate changes, and <code>@property</code> lets you provide read-only or validated attributes while keeping attribute syntax (see the properties lesson). This way you can change the internal representation later without breaking code that uses the class.`,
      },
      {
        heading: 'Why Encapsulate',
        body: `Encapsulation protects invariants (a balance never goes negative), reduces coupling (callers depend on a small interface), and makes refactoring safe. "We are all consenting adults" is the Python philosophy: conventions communicate intent, and developers respect them.`,
      },
    ],
    examples: [
      {
        caption: 'Public, protected and private attributes',
        code: `class Account:
    def __init__(self, owner, balance):
        self.owner = owner            # public
        self._branch = "Pune"         # protected (internal)
        self.__balance = balance      # private (name-mangled)

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.__balance += amount

    def withdraw(self, amount):
        if amount > self.__balance:
            raise ValueError("insufficient funds")
        self.__balance -= amount

    def balance(self):
        return self.__balance

acc = Account("Asha", 1000)
acc.deposit(500)
print(acc.owner, acc._branch, acc.balance())

try:
    print(acc.__balance)
except AttributeError as e:
    print("AttributeError:", e)

print(vars(acc))
print(acc._Account__balance)        # mangled name still exists`,
        output: `Asha Pune 1500
AttributeError: 'Account' object has no attribute '__balance'
{'owner': 'Asha', '_branch': 'Pune', '_Account__balance': 1500}
1500`,
      },
      {
        caption: 'Name mangling prevents clashes in subclasses',
        code: `class Parent:
    def __init__(self):
        self.__secret = "parent"
        self._shared = "parent"

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__secret = "child"      # a different attribute: _Child__secret
        self._shared = "child"       # overwrites the parent's

c = Child()
print(sorted(vars(c).items()))`,
        output: `[('_Child__secret', 'child'), ('_Parent__secret', 'parent'), ('_shared', 'child')]`,
      },
      {
        caption: 'Encapsulating with a read-only property and validated setter',
        code: `class Employee:
    def __init__(self, name, salary):
        self._name = name
        self.salary = salary              # goes through the setter

    @property
    def name(self):                       # read-only
        return self._name

    @property
    def salary(self):
        return self._salary

    @salary.setter
    def salary(self, value):
        if value < 0:
            raise ValueError("salary cannot be negative")
        self._salary = value

e = Employee("Kiran", 50000)
e.salary = 55000
print(e.name, e.salary)
for action in (lambda: setattr(e, "salary", -1), lambda: setattr(e, "name", "X")):
    try:
        action()
    except (ValueError, AttributeError) as err:
        print(type(err).__name__, "-", err)`,
        output: `Kiran 55000
ValueError - salary cannot be negative
AttributeError - property 'name' of 'Employee' object has no setter`,
      },
    ],
    commonMistakes: [
      'Believing __private attributes are secure; they are only name-mangled.',
      'Writing Java-style get_x()/set_x() for every attribute instead of plain attributes or properties.',
      'Accessing another class\'s _protected attributes from outside it.',
      'Exposing internal mutable lists directly so callers can bypass validation.',
    ],
    keyPoints: [
      'Python uses conventions: public, _protected, __private.',
      '__name is name-mangled to _Class__name, avoiding clashes but not providing security.',
      'Expose behaviour through methods and properties that enforce rules.',
      'Encapsulation protects invariants and allows internal changes without breaking callers.',
    ],
  },
}
