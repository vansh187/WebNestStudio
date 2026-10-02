// Practice blocks for the Python Object-Oriented Programming module. Merged onto the
// lesson entries in index.js by slug, so the lesson prose files stay unchanged.
export const practicePythonOop = {
  'oop': {
    whyItMatters: `Larger programs are organised around objects: a user, an order, a database connection. Django models, FastAPI schemas and most libraries you will use are classes, so reading and writing them is unavoidable. Object-oriented design is also the subject of a large share of Python interview questions.`,
    exercise: {
      prompt: `Write a <code>Book</code> class with a title and a price. Printing a book should show its title and price, and two books should be equal when they have the same title.

Expected output: <code>Clean Code (450)</code> then <code>True</code>`,
      starterCode: `class Book:
    # TODO: __init__ storing title and price
    # TODO: __str__ returning e.g. "Clean Code (450)"
    # TODO: __eq__ comparing titles
    pass


print(Book("Clean Code", 450))
print(Book("Clean Code", 450) == Book("Clean Code", 300))`,
      hints: [
        '<code>__str__</code> must return a string; <code>print</code> calls it automatically.',
        '<code>__eq__(self, other)</code> returns <code>self.title == other.title</code>.',
      ],
      solution: `class Book:
    def __init__(self, title, price):
        self.title = title
        self.price = price

    def __str__(self):
        return f"{self.title} ({self.price})"

    def __eq__(self, other):
        return self.title == other.title


print(Book("Clean Code", 450))
print(Book("Clean Code", 450) == Book("Clean Code", 300))`,
    },
    quiz: [
      {
        question: 'What is <code>self</code> in a method?',
        options: ['A keyword that means the class', 'The parent class', 'A global variable', 'The object the method was called on'],
        answer: 3,
        explanation: 'Python passes the object as the first argument. The name self is a convention.',
      },
      {
        question: 'When is <code>__init__</code> called?',
        options: ['Each time a new object of the class is created', 'When the class is defined', 'When the object is printed', 'When the program ends'],
        answer: 0,
        explanation: 'It sets up the attributes of the new object.',
      },
      {
        question: 'What does <code>super().__init__(name)</code> do in a subclass?',
        options: ['Creates a second object', 'Runs the parent class\'s __init__ for this object', 'Deletes the parent', 'Calls the subclass again'],
        answer: 1,
        explanation: 'It lets the parent set up its own attributes before the subclass adds more.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the four main principles of object-oriented programming?',
        answer: `Encapsulation: keeping data and the methods that work on it together, and hiding internal details. Abstraction: exposing what an object does without how it does it. Inheritance: a class reusing and extending another class. Polymorphism: different classes responding to the same method call in their own way.`,
      },
      {
        question: 'What is the difference between a class and an object?',
        answer: `A class is a definition: it describes which attributes and methods its objects will have. An object, or instance, is a concrete thing created from the class, with its own values for those attributes. One class can produce any number of objects, each independent of the others.`,
      },
    ],
  },

  'classes-and-objects': {
    whyItMatters: `The difference between an attribute that belongs to the class and one that belongs to a single object is small in the code and large in its effect. Getting it wrong leads to data that is shared between objects when it should not be. This lesson is the foundation for every other topic in object-oriented Python.`,
    exercise: {
      prompt: `Write a <code>Student</code> class with a class attribute <code>school</code> set to <code>WebNest</code> and a class attribute <code>count</code> that increases each time a student is created. Then observe what happens when <code>school</code> is assigned through one object.

Expected output: <code>2</code>, <code>Other</code>, <code>WebNest</code> (one per line)`,
      starterCode: `class Student:
    # TODO: class attributes school and count
    # TODO: __init__ that stores the name and increases the shared count
    pass


first = Student("Asha")
second = Student("Ravi")
print(Student.count)

first.school = "Other"
print(first.school)
print(second.school)`,
      hints: [
        'Class attributes are assigned directly in the class body, outside any method.',
        'Increase the shared counter with <code>Student.count += 1</code>. Writing <code>self.count += 1</code> would create a separate attribute on the object.',
      ],
      solution: `class Student:
    school = "WebNest"
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count += 1


first = Student("Asha")
second = Student("Ravi")
print(Student.count)

first.school = "Other"
print(first.school)
print(second.school)`,
    },
    quiz: [
      {
        question: 'Where is a class attribute stored?',
        options: ['In every object separately', 'In the module', 'On the class, and shared by all its objects', 'In __init__'],
        answer: 2,
        explanation: 'Objects read it through the class unless they have an attribute of their own with the same name.',
      },
      {
        question: 'Two objects of a class that defines no <code>__eq__</code> hold the same values. What does <code>a == b</code> return?',
        options: ['True', 'False', 'It raises an error', 'None'],
        answer: 1,
        explanation: 'Without __eq__, equality falls back to identity, and they are two different objects.',
      },
      {
        question: 'Which call is equivalent to <code>account.deposit(100)</code>?',
        options: ['Account.deposit(account, 100)', 'deposit(account, 100)', 'Account(deposit, 100)', 'account.Account.deposit(100)'],
        answer: 0,
        explanation: 'The object before the dot is passed as the first argument, self.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a class attribute and an instance attribute?',
        answer: `A class attribute is defined in the class body and there is one copy, shared by every object. An instance attribute is assigned through <code>self</code>, usually in <code>__init__</code>, and each object has its own. Reading an attribute looks on the object first and then on the class. Assigning through an object always creates or changes an instance attribute, which then hides the class attribute for that object only.`,
      },
      {
        question: 'Why is a mutable class attribute dangerous?',
        answer: `A list or dictionary defined in the class body is a single object shared by all instances. If one instance appends to it, every instance sees the new item, which is rarely intended. Data that should belong to each object must be created in <code>__init__</code>, as in <code>self.items = []</code>.`,
      },
    ],
  },

  'constructors-and-the-init-method': {
    whyItMatters: `The constructor is where an object is given a valid starting state. Checking the arguments there means an invalid object can never exist, so the rest of the code does not have to check again. Alternative constructors written as class methods are a common pattern in the standard library, for example <code>datetime.fromisoformat</code>.`,
    exercise: {
      prompt: `Write a <code>Temperature</code> class that stores a value in Celsius and rejects values below absolute zero (-273.15) with a <code>ValueError</code>. Add a class method <code>from_fahrenheit</code> as an alternative constructor.

Expected output: <code>100.0</code> then <code>invalid</code>`,
      starterCode: `class Temperature:
    # TODO: __init__(self, celsius) that raises ValueError below -273.15
    # TODO: a class method from_fahrenheit(cls, fahrenheit)
    pass


print(Temperature.from_fahrenheit(212).celsius)

try:
    Temperature(-300)
except ValueError:
    print("invalid")`,
      hints: [
        'Celsius is <code>(fahrenheit - 32) * 5 / 9</code>.',
        'A class method is marked with <code>@classmethod</code> and returns <code>cls(...)</code>, which calls <code>__init__</code>.',
      ],
      solution: `class Temperature:
    def __init__(self, celsius):
        if celsius < -273.15:
            raise ValueError("below absolute zero")
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, fahrenheit):
        return cls((fahrenheit - 32) * 5 / 9)


print(Temperature.from_fahrenheit(212).celsius)

try:
    Temperature(-300)
except ValueError:
    print("invalid")`,
    },
    quiz: [
      {
        question: 'What should <code>__init__</code> return?',
        options: ['The new object', 'None', 'True', 'The class'],
        answer: 1,
        explanation: 'It only initialises the object. Returning anything other than None raises TypeError.',
      },
      {
        question: 'Which method actually creates the object, before <code>__init__</code> runs?',
        options: ['__create__', '__new__', '__call__', '__del__'],
        answer: 1,
        explanation: '__new__ creates and returns the object, and __init__ then initialises it.',
      },
      {
        question: 'Which decorator is used to write an alternative constructor?',
        options: ['@staticmethod', '@property', '@classmethod', '@constructor'],
        answer: 2,
        explanation: 'The method receives the class as cls and returns cls(...).',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between __new__ and __init__?',
        answer: `<code>__new__</code> is called first; it receives the class and creates and returns the new object. <code>__init__</code> is then called on that object to set its attributes, and returns nothing. <code>__new__</code> is rarely overridden; the usual reasons are subclassing an immutable type such as <code>tuple</code> or <code>str</code>, or controlling creation, as in a singleton.`,
      },
      {
        question: 'Can a Python class have more than one constructor?',
        answer: `A class can have only one <code>__init__</code>, because a second definition with the same name replaces the first. Different ways of creating an object are provided through default arguments, or through class methods that act as alternative constructors, such as <code>Temperature.from_fahrenheit(...)</code>, each of which builds the arguments and calls the class.`,
      },
    ],
  },

  'instance-class-and-static-methods': {
    whyItMatters: `The three kinds of method differ in what they can reach: the object, the class, or neither. Choosing the right one tells the reader what the method depends on, and class methods in particular are how factory methods are written so that they keep working in subclasses. This is a regular interview question.`,
    exercise: {
      prompt: `Complete the <code>Pizza</code> class with an instance method <code>describe</code>, a class method <code>margherita</code> that creates a pizza with cheese and tomato, and a static method <code>is_valid_size</code> that accepts only 8, 12 and 16.

Expected output: <code>Pizza with cheese, tomato</code> then <code>True</code>`,
      starterCode: `class Pizza:
    def __init__(self, toppings):
        self.toppings = toppings

    # TODO: instance method describe() -> "Pizza with cheese, tomato"
    # TODO: class method margherita() -> a Pizza with ["cheese", "tomato"]
    # TODO: static method is_valid_size(size) -> True for 8, 12 or 16


print(Pizza.margherita().describe())
print(Pizza.is_valid_size(12))`,
      hints: [
        '<code>", ".join(self.toppings)</code> builds the list of toppings as text.',
        'A class method takes <code>cls</code> as its first parameter; a static method takes neither <code>self</code> nor <code>cls</code>.',
      ],
      solution: `class Pizza:
    def __init__(self, toppings):
        self.toppings = toppings

    def describe(self):
        return "Pizza with " + ", ".join(self.toppings)

    @classmethod
    def margherita(cls):
        return cls(["cheese", "tomato"])

    @staticmethod
    def is_valid_size(size):
        return size in (8, 12, 16)


print(Pizza.margherita().describe())
print(Pizza.is_valid_size(12))`,
    },
    quiz: [
      {
        question: 'What is passed as the first argument of a class method?',
        options: ['The object', 'The module', 'Nothing', 'The class'],
        answer: 3,
        explanation: 'By convention the parameter is named cls.',
      },
      {
        question: 'What does a static method receive automatically?',
        options: ['The object', 'The class', 'Nothing; only the arguments given by the caller', 'Both the object and the class'],
        answer: 2,
        explanation: 'It is an ordinary function placed inside the class for organisation.',
      },
      {
        question: 'Which kind of method can read and change the attributes of one particular object?',
        options: ['Instance method', 'Class method', 'Static method', 'None of them'],
        answer: 0,
        explanation: 'Only an instance method receives the object, as self.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between @classmethod and @staticmethod?',
        answer: `A class method receives the class as its first argument and can read or change class-level state and create instances; called on a subclass, it receives that subclass, which is why it is used for factory methods. A static method receives nothing automatically and cannot reach the class or an object; it is a plain function that lives in the class because it is logically related to it.`,
      },
      {
        question: 'When would you use a static method?',
        answer: `For a helper that belongs with the class conceptually but needs no data from the object or the class, such as validating a value or converting a unit. If the function needs the class, for example to create an instance, it should be a class method; if it is unrelated to the class, it should be a module-level function.`,
      },
    ],
  },

  'inheritance': {
    whyItMatters: `Inheritance lets a new class reuse an existing one and change only what differs. Frameworks depend on it: you write a Django model by inheriting from <code>Model</code>, an exception by inheriting from <code>Exception</code>, a test case by inheriting from <code>TestCase</code>. Understanding <code>super()</code> and the method resolution order is what makes those work as expected.`,
    exercise: {
      prompt: `<code>Employee</code> is given. Write <code>Manager</code>, which inherits from it, takes an extra <code>bonus</code>, and overrides <code>pay</code> to return the salary plus the bonus, reusing the parent's method. Then print the names of the classes in the method resolution order of <code>Manager</code>.

Expected output: <code>60000</code> then <code>['Manager', 'Employee', 'object']</code>`,
      starterCode: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def pay(self):
        return self.salary


# TODO: class Manager(Employee) with a bonus and an overridden pay()


print(Manager("Asha", 50000, 10000).pay())
print([cls.__name__ for cls in Manager.__mro__])`,
      hints: [
        'Call <code>super().__init__(name, salary)</code> so the parent stores the name and salary.',
        'In <code>pay</code>, return <code>super().pay() + self.bonus</code>.',
      ],
      solution: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def pay(self):
        return self.salary


class Manager(Employee):
    def __init__(self, name, salary, bonus):
        super().__init__(name, salary)
        self.bonus = bonus

    def pay(self):
        return super().pay() + self.bonus


print(Manager("Asha", 50000, 10000).pay())
print([cls.__name__ for cls in Manager.__mro__])`,
    },
    quiz: [
      {
        question: 'Does Python support multiple inheritance?',
        options: ['No', 'Yes; a class can list several parent classes', 'Only for abstract classes', 'Only through mixins'],
        answer: 1,
        explanation: 'For example, class C(A, B). The order of the parents matters.',
      },
      {
        question: 'What is the MRO?',
        options: ['The order in which objects are created', 'A memory optimisation', 'The order in which classes are searched for a method or attribute', 'The list of a module\'s imports'],
        answer: 2,
        explanation: 'It can be inspected with ClassName.__mro__.',
      },
      {
        question: 'A subclass defines a method with the same name as one in its parent. Which runs when it is called on a subclass object?',
        options: ['The subclass\'s', 'The parent\'s', 'Both, parent first', 'It raises an error'],
        answer: 0,
        explanation: 'This is overriding. The parent\'s version is still reachable through super().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the method resolution order and how does Python handle the diamond problem?',
        answer: `The MRO is the order in which Python searches classes when looking up a method. With multiple inheritance, two parents may share a common ancestor, forming a diamond. Python builds a single linear order using the C3 algorithm: a class comes before its parents, parents keep the order in which they were listed, and each class appears once. <code>super()</code> follows this order, so the shared ancestor's method runs only once.`,
      },
      {
        question: 'What is a mixin?',
        answer: `A mixin is a small class that provides one piece of behaviour, such as converting to JSON or logging, and is meant to be combined with other classes through multiple inheritance. It is not intended to be instantiated on its own and usually has no state. Mixins allow a feature to be shared between classes that are otherwise unrelated.`,
      },
    ],
  },

  'polymorphism-and-method-overriding': {
    whyItMatters: `Polymorphism is what lets one piece of code work with many kinds of object. A function that calls <code>area()</code> does not need to know which shape it has been given, so new shapes can be added without changing it. Python takes this further with duck typing: any object that has the right method will do.`,
    exercise: {
      prompt: `Write two unrelated classes, <code>Square</code> and <code>Rectangle</code>, each with an <code>area()</code> method. Then loop over a list containing one of each, print each area, and print the total.

Expected output: <code>4</code>, <code>6</code>, <code>10</code> (one per line)`,
      starterCode: `# TODO: class Square(side) with area()
# TODO: class Rectangle(width, height) with area()


shapes = [Square(2), Rectangle(2, 3)]

# TODO: print each area, then the total of all areas`,
      hints: [
        'The two classes need no common parent; they only need a method with the same name.',
        '<code>sum(shape.area() for shape in shapes)</code> adds the areas.',
      ],
      solution: `class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side * self.side


class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height


shapes = [Square(2), Rectangle(2, 3)]

for shape in shapes:
    print(shape.area())
print(sum(shape.area() for shape in shapes))`,
    },
    quiz: [
      {
        question: 'What does duck typing mean?',
        options: ['An object is suitable if it has the methods that are needed, whatever its class', 'Every class must inherit from a common base', 'Types are checked before the program runs', 'Only built-in types can be used'],
        answer: 0,
        explanation: '"If it walks like a duck and quacks like a duck, it is a duck."',
      },
      {
        question: '<code>len()</code> works on a string, a list and a dictionary. What is this an example of?',
        options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Recursion'],
        answer: 1,
        explanation: 'The same call works with different types, each of which implements __len__.',
      },
      {
        question: 'Which method does a class define so that <code>a + b</code> works for its objects?',
        options: ['__plus__', '__sum__', '__add__', '__concat__'],
        answer: 2,
        explanation: 'Each operator maps to a special method.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is polymorphism and how does Python provide it?',
        answer: `Polymorphism means that the same operation behaves appropriately for different types. In Python it comes from method overriding, where subclasses give their own version of an inherited method; from duck typing, where any object with the required method can be used; and from special methods, which let operators and built-in functions such as <code>+</code> and <code>len()</code> work with your own classes.`,
      },
      {
        question: 'What is the difference between overriding and overloading?',
        answer: `Overriding is a subclass defining a method with the same name as one in its parent, replacing the parent's behaviour for objects of the subclass. Overloading is having several methods with the same name and different parameter lists in one class. Python supports overriding but not overloading in that form: a second definition with the same name simply replaces the first.`,
      },
    ],
  },

  'method-overloading-in-python': {
    whyItMatters: `Developers arriving from Java or C++ expect to write several functions with the same name and different parameters, and are surprised when only the last one exists. Python reaches the same goal in other ways, and knowing them is necessary both to write flexible functions and to answer a question that interviewers often ask of people with a Java background.`,
    exercise: {
      prompt: `Use <code>functools.singledispatch</code> to write a function <code>describe</code> that behaves differently for an <code>int</code>, a <code>str</code> and a <code>list</code>.

Expected output: <code>int: 5</code>, <code>str: hi</code>, <code>list of 2 items</code> (one per line)`,
      starterCode: `from functools import singledispatch


@singledispatch
def describe(value):
    return "unknown"


# TODO: register a version for int   -> "int: 5"
# TODO: register a version for str   -> "str: hi"
# TODO: register a version for list  -> "list of 2 items"


print(describe(5))
print(describe("hi"))
print(describe([1, 2]))`,
      hints: [
        'Each version is decorated with <code>@describe.register</code> and has a type hint on its first parameter.',
        'The function name for the registered versions does not matter; <code>_</code> is commonly used.',
      ],
      solution: `from functools import singledispatch


@singledispatch
def describe(value):
    return "unknown"


@describe.register
def _(value: int):
    return f"int: {value}"


@describe.register
def _(value: str):
    return f"str: {value}"


@describe.register
def _(value: list):
    return f"list of {len(value)} items"


print(describe(5))
print(describe("hi"))
print(describe([1, 2]))`,
    },
    quiz: [
      {
        question: 'A class defines <code>def area(self, r)</code> and then <code>def area(self, w, h)</code>. What happens?',
        options: ['Both are available', 'A syntax error', 'The second definition replaces the first', 'The first replaces the second'],
        answer: 2,
        explanation: 'A name can refer to only one function. Calling area with one argument now fails.',
      },
      {
        question: 'What is the simplest way to let a function be called with different numbers of arguments?',
        options: ['Default values and *args', 'Define it several times', 'A separate class for each case', 'It cannot be done'],
        answer: 0,
        explanation: 'One function with optional parameters covers most uses of overloading.',
      },
      {
        question: 'On what does <code>functools.singledispatch</code> choose which version to run?',
        options: ['The number of arguments', 'The type of the first argument', 'The name of the caller', 'The return type'],
        answer: 1,
        explanation: 'singledispatchmethod does the same for methods, using the first argument after self.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Does Python support method overloading?',
        answer: `Not in the sense used in Java. Functions are stored by name, so a second definition replaces the first. The same result is achieved with default argument values, with <code>*args</code> and <code>**kwargs</code>, by checking the type of an argument inside the function, or with <code>functools.singledispatch</code>, which selects an implementation from the type of the first argument.`,
      },
      {
        question: 'What is typing.overload for?',
        answer: `It is for type checkers only. Several signatures decorated with <code>@overload</code> describe the different ways a function may be called and what each returns, followed by one real implementation. It gives editors and tools such as mypy precise information, but it has no effect at runtime and does not create separate functions.`,
      },
    ],
  },

  'encapsulation-and-access-modifiers': {
    whyItMatters: `An object that lets any code change its data directly cannot guarantee that the data stays valid: a bank balance could be set to a negative number from anywhere. Encapsulation puts the rules in one place. Python does this by convention and with properties, not with keywords such as <code>private</code>, which is a common source of confusion.`,
    exercise: {
      prompt: `Write a <code>BankAccount</code> class that keeps its balance in a private attribute, accepts deposits of positive amounts only, and exposes the balance through a read-only property.

Expected output: <code>500</code>, <code>read-only</code>, <code>False</code> (one per line)`,
      starterCode: `class BankAccount:
    def __init__(self):
        self.__balance = 0

    # TODO: deposit(amount) that raises ValueError unless amount > 0
    # TODO: a read-only property named balance


account = BankAccount()
account.deposit(500)
print(account.balance)

try:
    account.balance = 0
except AttributeError:
    print("read-only")

print(hasattr(account, "__balance"))`,
      hints: [
        'A method decorated with <code>@property</code> is read like an attribute.',
        'With no setter defined, assigning to the property raises <code>AttributeError</code>.',
      ],
      solution: `class BankAccount:
    def __init__(self):
        self.__balance = 0

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.__balance += amount

    @property
    def balance(self):
        return self.__balance


account = BankAccount()
account.deposit(500)
print(account.balance)

try:
    account.balance = 0
except AttributeError:
    print("read-only")

print(hasattr(account, "__balance"))`,
    },
    quiz: [
      {
        question: 'What does a single leading underscore, as in <code>_cache</code>, mean?',
        options: ['Python blocks access from outside the class', 'The attribute is static', 'A convention: the attribute is internal and should not be used from outside', 'The attribute is constant'],
        answer: 2,
        explanation: 'Nothing is enforced. It is a signal to other programmers.',
      },
      {
        question: 'Inside class <code>Account</code>, an attribute is written as <code>self.__pin</code>. Under what name is it actually stored?',
        options: ['__pin', 'Account.pin', '_pin', '_Account__pin'],
        answer: 3,
        explanation: 'This renaming is called name mangling.',
      },
      {
        question: 'Does Python have truly private attributes?',
        options: ['No; privacy is by convention, and mangled names can still be reached', 'Yes, with the private keyword', 'Yes, with a double underscore', 'Only in abstract classes'],
        answer: 0,
        explanation: 'The language relies on convention, not on enforcement.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How is encapsulation achieved in Python?',
        answer: `By convention and by properties. A name starting with one underscore is treated as internal. A name starting with two underscores is mangled to include the class name, which prevents accidental access and clashes in subclasses. Access that needs rules is given through methods or a <code>@property</code>, so validation happens in one place while the attribute is still used with plain attribute syntax.`,
      },
      {
        question: 'What is name mangling and what is it for?',
        answer: `An attribute named with two leading underscores inside a class, such as <code>__balance</code>, is stored as <code>_ClassName__balance</code>. Its main purpose is to stop a subclass from accidentally overwriting an attribute of its parent by choosing the same name. It is not a security feature, since the mangled name can still be used from outside.`,
      },
    ],
  },

  'abstraction-and-abstract-base-classes': {
    whyItMatters: `When several classes must offer the same set of methods — every payment method must be able to pay, every exporter must be able to export — an abstract base class states that contract and enforces it. A subclass that forgets a required method fails as soon as it is created, not later in production when the missing method is first called.`,
    exercise: {
      prompt: `Define an abstract base class <code>PaymentMethod</code> with an abstract method <code>pay(amount)</code>, and a concrete class <code>CardPayment</code> that implements it. Show that the abstract class itself cannot be instantiated.

Expected output: <code>Paid 100 by card</code> then <code>cannot instantiate</code>`,
      starterCode: `from abc import ABC, abstractmethod


# TODO: abstract class PaymentMethod with an abstract method pay(amount)

# TODO: class CardPayment(PaymentMethod) whose pay returns "Paid 100 by card"


print(CardPayment().pay(100))

try:
    PaymentMethod()
except TypeError:
    print("cannot instantiate")`,
      hints: [
        'The abstract class inherits from <code>ABC</code>, and the method is decorated with <code>@abstractmethod</code>.',
        'The body of an abstract method can be just <code>pass</code> or a docstring.',
      ],
      solution: `from abc import ABC, abstractmethod


class PaymentMethod(ABC):
    @abstractmethod
    def pay(self, amount):
        pass


class CardPayment(PaymentMethod):
    def pay(self, amount):
        return f"Paid {amount} by card"


print(CardPayment().pay(100))

try:
    PaymentMethod()
except TypeError:
    print("cannot instantiate")`,
    },
    quiz: [
      {
        question: 'Which module provides abstract base classes?',
        options: ['abstract', 'abc', 'typing', 'base'],
        answer: 1,
        explanation: 'It provides the ABC class and the abstractmethod decorator.',
      },
      {
        question: 'A subclass does not implement one of the abstract methods of its parent. What happens?',
        options: ['The class cannot be defined', 'The method returns None', 'Creating an object of the subclass raises TypeError', 'Nothing'],
        answer: 2,
        explanation: 'The subclass is still abstract until every abstract method has been implemented.',
      },
      {
        question: 'Can an abstract base class contain ordinary methods with code in them?',
        options: ['No', 'Only properties', 'Only static methods', 'Yes; subclasses inherit them'],
        answer: 3,
        explanation: 'This is how shared behaviour is combined with required methods, as in the template method pattern.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is an abstract class and how do you create one in Python?',
        answer: `An abstract class is one that cannot be instantiated and exists to be inherited from. It declares methods that every subclass must provide. In Python it is created by inheriting from <code>abc.ABC</code> and marking the required methods with <code>@abstractmethod</code>. A subclass can be instantiated only once it has implemented all of them.`,
      },
      {
        question: 'Does Python have interfaces?',
        answer: `There is no <code>interface</code> keyword. An abstract base class containing only abstract methods plays the same role, and a class may inherit from several of them. <code>typing.Protocol</code> offers a second approach, structural typing: a class satisfies the protocol simply by having the right methods, with no inheritance required, which matches Python's duck typing.`,
      },
    ],
  },

  'magic-methods-and-operator-overloading': {
    whyItMatters: `Special methods are how your own classes take part in the language: being printed, compared, added, sorted, looped over and used in a <code>with</code> statement. Libraries such as NumPy, pandas and pathlib feel natural to use precisely because they define these methods, and a class without <code>__repr__</code> is painful to debug.`,
    exercise: {
      prompt: `Write a <code>Vector</code> class with <code>x</code> and <code>y</code>. Adding two vectors should produce a new vector, two vectors with the same values should be equal, and a vector should print in the form shown.

Expected output: <code>Vector(4, 6)</code> then <code>True</code>`,
      starterCode: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # TODO: __repr__ -> "Vector(4, 6)"
    # TODO: __add__ -> a new Vector
    # TODO: __eq__ -> True when x and y match


print(Vector(1, 2) + Vector(3, 4))
print(Vector(1, 2) == Vector(1, 2))`,
      hints: [
        '<code>__add__(self, other)</code> should return <code>Vector(self.x + other.x, self.y + other.y)</code>.',
        '<code>print</code> uses <code>__repr__</code> when the class has no <code>__str__</code>.',
      ],
      solution: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y


print(Vector(1, 2) + Vector(3, 4))
print(Vector(1, 2) == Vector(1, 2))`,
    },
    quiz: [
      {
        question: 'A class defines <code>__repr__</code> but not <code>__str__</code>. What does <code>print(obj)</code> show?',
        options: ['The default text with a memory address', 'The result of __repr__', 'An error', 'Nothing'],
        answer: 1,
        explanation: 'str() falls back to __repr__ when __str__ is not defined.',
      },
      {
        question: 'Which method makes <code>len(obj)</code> work?',
        options: ['__size__', '__len__', '__length__', '__count__'],
        answer: 1,
        explanation: 'Built-in functions call the matching special method on the object.',
      },
      {
        question: 'A class defines <code>__eq__</code> and nothing else. Can its objects be put in a set?',
        options: ['Yes', 'Only if they are equal', 'No; defining __eq__ without __hash__ makes the objects unhashable', 'Only in a frozenset'],
        answer: 2,
        explanation: 'Python sets __hash__ to None in that case. Define __hash__ consistently with __eq__ to allow it.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between __str__ and __repr__?',
        answer: `<code>__repr__</code> is meant for developers: it should be unambiguous and ideally look like the code that would recreate the object. It is used by the REPL, by debuggers and when an object appears inside a list. <code>__str__</code> is meant for end users and is used by <code>print()</code> and <code>str()</code>. If only one is written it should be <code>__repr__</code>, since <code>__str__</code> falls back to it.`,
      },
      {
        question: 'How are __eq__ and __hash__ related?',
        answer: `Objects that compare as equal must have the same hash, because dictionaries and sets use the hash to find a candidate and then <code>==</code> to confirm it. A class that defines <code>__eq__</code> therefore loses its default <code>__hash__</code> and becomes unhashable unless <code>__hash__</code> is also defined, typically as the hash of a tuple of the fields used in <code>__eq__</code>. Those fields should not change while the object is in a set or used as a key.`,
      },
    ],
  },

  'properties-and-descriptors': {
    whyItMatters: `A property lets a class start with a plain attribute and add validation or a calculation later, without changing any code that uses it. This is why Python code does not need the getter and setter methods that are standard in Java. Descriptors, the mechanism underneath, are how ORMs such as Django and SQLAlchemy make a class attribute behave like a database column.`,
    exercise: {
      prompt: `Write a <code>Product</code> class whose <code>price</code> is a property that rejects negative values with a <code>ValueError</code>, and which has a computed read-only property <code>price_with_tax</code> that adds 18%.

Expected output: <code>118.0</code> then <code>price cannot be negative</code>`,
      starterCode: `class Product:
    def __init__(self, price):
        self.price = price

    # TODO: property price, with a setter that raises
    #       ValueError("price cannot be negative") for values below 0
    # TODO: read-only property price_with_tax (price plus 18%, rounded to 2 decimals)


product = Product(100)
print(product.price_with_tax)

try:
    product.price = -5
except ValueError as error:
    print(error)`,
      hints: [
        'Store the value in <code>self._price</code>. The getter is decorated with <code>@property</code> and the setter with <code>@price.setter</code>.',
        'Because <code>__init__</code> assigns <code>self.price</code>, the setter also validates the value given to the constructor.',
      ],
      solution: `class Product:
    def __init__(self, price):
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price cannot be negative")
        self._price = value

    @property
    def price_with_tax(self):
        return round(self._price * 1.18, 2)


product = Product(100)
print(product.price_with_tax)

try:
    product.price = -5
except ValueError as error:
    print(error)`,
    },
    quiz: [
      {
        question: 'How is a property named <code>area</code> read?',
        options: ['obj.area()', 'area(obj)', 'obj.get_area()', 'obj.area'],
        answer: 3,
        explanation: 'A property is used like an attribute, without parentheses.',
      },
      {
        question: 'Which decorator defines the setter for a property named <code>price</code>?',
        options: ['@price.setter', '@setter', '@property.setter', '@set_price'],
        answer: 0,
        explanation: 'The setter is attached to the property object created by @property.',
      },
      {
        question: 'What does <code>functools.cached_property</code> do?',
        options: ['Recomputes the value on every access', 'Computes the value on first access and stores it on the object', 'Makes the attribute private', 'Shares the value between all objects'],
        answer: 1,
        explanation: 'It suits a value that is costly to compute and does not change.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use a property instead of getter and setter methods?',
        answer: `Code that uses the class keeps the simple attribute syntax, <code>obj.price</code> and <code>obj.price = 10</code>, while the class runs a method behind it. A class can therefore begin with a plain public attribute and switch to a property when validation or a calculation becomes necessary, without any change for its callers. Explicit <code>get_x()</code> and <code>set_x()</code> methods are not idiomatic in Python.`,
      },
      {
        question: 'What is a descriptor?',
        answer: `A descriptor is an object that defines <code>__get__</code>, <code>__set__</code> or <code>__delete__</code> and is assigned as a class attribute. When that attribute is read or written on an instance, Python calls the descriptor's method. Properties, methods, <code>classmethod</code> and <code>staticmethod</code> are all implemented as descriptors, and writing your own lets the same validation be reused for many attributes.`,
      },
    ],
  },

  'dataclasses': {
    whyItMatters: `A great many classes exist only to hold a few fields. Writing <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for each by hand is repetitive and easy to get out of step. <code>@dataclass</code> generates them from the field list, and it is now the standard way to define such classes; Pydantic models, used throughout FastAPI, follow the same style.`,
    exercise: {
      prompt: `Define a dataclass <code>Point</code> with an integer <code>x</code> and an integer <code>y</code> that defaults to 0, and a dataclass <code>Cart</code> whose <code>items</code> field is a list that is separate for every cart.

Expected output: <code>Point(x=1, y=0)</code>, <code>True</code>, <code>[]</code> (one per line)`,
      starterCode: `from dataclasses import dataclass, field


# TODO: dataclass Point with x: int and y: int = 0

# TODO: dataclass Cart with items: list, each cart getting its own empty list


print(Point(1))
print(Point(1, 2) == Point(1, 2))

first = Cart()
first.items.append("pen")
second = Cart()
print(second.items)`,
      hints: [
        'A field is declared as <code>name: type</code>, with an optional <code>= default</code>.',
        'A mutable default must be given as <code>field(default_factory=list)</code>.',
      ],
      solution: `from dataclasses import dataclass, field


@dataclass
class Point:
    x: int
    y: int = 0


@dataclass
class Cart:
    items: list = field(default_factory=list)


print(Point(1))
print(Point(1, 2) == Point(1, 2))

first = Cart()
first.items.append("pen")
second = Cart()
print(second.items)`,
    },
    quiz: [
      {
        question: 'Which methods does <code>@dataclass</code> generate by default?',
        options: ['__init__, __repr__ and __eq__', 'Only __init__', 'All comparison methods', 'None'],
        answer: 0,
        explanation: 'Ordering methods are added with order=True and hashing with frozen=True.',
      },
      {
        question: 'What does <code>@dataclass(frozen=True)</code> do?',
        options: ['Makes the class abstract', 'Hides the fields', 'Speeds up the class', 'Makes instances immutable; assigning to a field raises an error'],
        answer: 3,
        explanation: 'A frozen dataclass is also hashable, so it can be used as a dictionary key.',
      },
      {
        question: 'What happens if a dataclass field is declared as <code>items: list = []</code>?',
        options: ['ValueError is raised when the class is defined', 'Each object gets its own list', 'All objects share one list silently', 'The field is ignored'],
        answer: 0,
        explanation: 'Dataclasses refuse mutable defaults to prevent the shared-list bug. Use default_factory.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a dataclass and when would you use one?',
        answer: `A dataclass is a class decorated with <code>@dataclass</code>, for which Python generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> from the annotated fields. It is used for classes whose main job is to hold data, such as a configuration object or a record read from a file. It remains an ordinary class, so methods and properties can be added.`,
      },
      {
        question: 'What is __post_init__ used for?',
        answer: `It is a method that the generated <code>__init__</code> calls after the fields have been assigned. It is the place for validation, for converting values, and for setting fields that are calculated from others, which are declared with <code>field(init=False)</code> so that they are not constructor parameters.`,
      },
    ],
  },

  'enums': {
    whyItMatters: `Order statuses, user roles and days of the week have a fixed set of values. Representing them as bare strings invites typing mistakes that fail silently: <code>"shiped"</code> is a perfectly valid string. An enum gives each value a name, makes a wrong name an immediate error, and documents every allowed value in one place.`,
    exercise: {
      prompt: `Define an enum <code>Status</code> with the members <code>PENDING</code>, <code>PAID</code> and <code>SHIPPED</code>, with the values 1, 2 and 3. Print the name and value of <code>PAID</code>, the member whose value is 1, and the names of all members.

Expected output: <code>PAID 2</code>, <code>Status.PENDING</code>, <code>['PENDING', 'PAID', 'SHIPPED']</code> (one per line)`,
      starterCode: `from enum import Enum


# TODO: enum Status with PENDING = 1, PAID = 2, SHIPPED = 3


# TODO: print the name and the value of Status.PAID
# TODO: print the member that has the value 1
# TODO: print a list of the names of all members`,
      hints: [
        'Each member has <code>.name</code> and <code>.value</code>. Calling the enum with a value, as in <code>Status(1)</code>, returns the member.',
        'An enum can be looped over: <code>[member.name for member in Status]</code>.',
      ],
      solution: `from enum import Enum


class Status(Enum):
    PENDING = 1
    PAID = 2
    SHIPPED = 3


print(Status.PAID.name, Status.PAID.value)
print(Status(1))
print([member.name for member in Status])`,
    },
    quiz: [
      {
        question: 'What does <code>Status(99)</code> do when no member has the value 99?',
        options: ['Returns None', 'Raises ValueError', 'Creates a new member', 'Returns the first member'],
        answer: 1,
        explanation: 'An invalid value is rejected immediately, which is one of the benefits of an enum.',
      },
      {
        question: 'What does <code>auto()</code> do in an enum?',
        options: ['Makes the enum mutable', 'Sorts the members', 'Assigns a value automatically', 'Creates aliases'],
        answer: 2,
        explanation: 'It is used when the particular values do not matter.',
      },
      {
        question: 'With a plain <code>Enum</code>, what does <code>Status.PAID == 2</code> return?',
        options: ['True', '2', 'It raises an error', 'False'],
        answer: 3,
        explanation: 'A member is not equal to its value. Compare members with each other, or use IntEnum.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why use an Enum instead of string or integer constants?',
        answer: `An enum restricts a value to a defined set, so a misspelled name raises an error where a misspelled string would pass unnoticed. The members can be listed and looped over, they print with meaningful names, editors can autocomplete them, and type checkers can verify them. Members are also singletons, so they are compared with <code>is</code>.`,
      },
      {
        question: 'What is the difference between Enum, IntEnum and StrEnum?',
        answer: `Members of a plain <code>Enum</code> are not equal to their values. Members of an <code>IntEnum</code> are also integers, and members of a <code>StrEnum</code>, added in Python 3.11, are also strings, so they compare equal to raw values and can be passed where an integer or string is expected, which is convenient for JSON and database values. The plain <code>Enum</code> is stricter and is the default choice.`,
      },
    ],
  },

  'composition-vs-inheritance': {
    whyItMatters: `Inheritance is the first tool people reach for, and deep class hierarchies are one of the main reasons code becomes hard to change. Building an object out of other objects is usually more flexible, and passing those parts in from outside is what makes code testable. "Favour composition over inheritance" is advice you will hear throughout your career.`,
    exercise: {
      prompt: `Write a <code>Car</code> class that is given an engine object when it is created and delegates to it. The same <code>Car</code> class must work with either kind of engine.

Expected output: <code>Petrol engine started</code> then <code>Electric motor started</code>`,
      starterCode: `class PetrolEngine:
    def start(self):
        return "Petrol engine started"


class ElectricEngine:
    def start(self):
        return "Electric motor started"


class Car:
    # TODO: accept an engine in __init__ and store it
    # TODO: start() should return whatever the engine's start() returns
    pass


print(Car(PetrolEngine()).start())
print(Car(ElectricEngine()).start())`,
      hints: [
        'The car has an engine; it is not a kind of engine, so no inheritance is needed.',
        'Calling a method on the stored object and returning its result is called delegation.',
      ],
      solution: `class PetrolEngine:
    def start(self):
        return "Petrol engine started"


class ElectricEngine:
    def start(self):
        return "Electric motor started"


class Car:
    def __init__(self, engine):
        self.engine = engine

    def start(self):
        return self.engine.start()


print(Car(PetrolEngine()).start())
print(Car(ElectricEngine()).start())`,
    },
    quiz: [
      {
        question: 'Which relationship does composition express?',
        options: ['has-a', 'is-a', 'equals', 'inherits'],
        answer: 0,
        explanation: 'A car has an engine. Inheritance expresses is-a: a manager is an employee.',
      },
      {
        question: 'What is dependency injection?',
        options: ['Installing packages with pip', 'Giving an object the things it needs from outside, usually through its constructor', 'Importing a module inside a function', 'Calling super()'],
        answer: 1,
        explanation: 'The object does not create its own dependencies, so they can be replaced.',
      },
      {
        question: 'Why does dependency injection make testing easier?',
        options: ['The tests run faster', 'No tests are needed', 'A fake object can be passed in place of a real database or email service', 'It removes the need for classes'],
        answer: 2,
        explanation: 'The test controls what the object talks to.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does "favour composition over inheritance" mean?',
        answer: `Build behaviour by combining small objects, each with one job, in preference to creating deep hierarchies of subclasses. Inheritance ties a subclass closely to its parent: a change in the parent can break every subclass, and combining features requires a new subclass for each combination. With composition, parts can be swapped, reused in other classes and replaced with fakes in tests.`,
      },
      {
        question: 'When is inheritance the right choice?',
        answer: `When there is a true is-a relationship and the subclass can be used anywhere the parent is expected, and when a framework is designed for it, as with exceptions, Django models or abstract base classes that define a contract. A shallow hierarchy with a stable parent is fine; inheriting only to reuse a few methods is usually a sign that composition would be better.`,
      },
    ],
  },

  'design-patterns-in-python': {
    whyItMatters: `Design patterns are names for solutions that developers arrive at again and again, and they form a shared vocabulary: saying "use a strategy here" is quicker than describing the code. Python's functions and modules make many of the classic patterns much shorter than in Java, and interviewers like to ask how a pattern would look in Python.`,
    exercise: {
      prompt: `Implement the strategy pattern with plain functions. <code>checkout</code> takes an amount and a discount function and returns the amount after the discount. Write the two discount functions.

Expected output: <code>900.0</code> then <code>1000</code>`,
      starterCode: `# TODO: no_discount(amount) returns the amount unchanged
# TODO: ten_percent(amount) returns the amount reduced by 10%


def checkout(amount, discount):
    return discount(amount)


print(checkout(1000, ten_percent))
print(checkout(1000, no_discount))`,
      hints: [
        'A function can be passed as an argument without parentheses: <code>checkout(1000, ten_percent)</code>.',
        'Reducing by 10% is multiplying by <code>0.9</code>.',
      ],
      solution: `def no_discount(amount):
    return amount


def ten_percent(amount):
    return amount * 0.9


def checkout(amount, discount):
    return discount(amount)


print(checkout(1000, ten_percent))
print(checkout(1000, no_discount))`,
    },
    quiz: [
      {
        question: 'Which pattern allows an algorithm to be chosen or swapped at runtime?',
        options: ['Singleton', 'Facade', 'Adapter', 'Strategy'],
        answer: 3,
        explanation: 'The behaviour is passed in, as a function or an object.',
      },
      {
        question: 'What does the singleton pattern guarantee?',
        options: ['That a class has only one instance', 'That a class cannot be inherited from', 'That objects are immutable', 'That methods run only once'],
        answer: 0,
        explanation: 'It is used for a shared resource such as configuration.',
      },
      {
        question: 'In the observer pattern, what happens when the subject changes?',
        options: ['Every registered observer is notified', 'It is deleted', 'It copies itself', 'Nothing'],
        answer: 0,
        explanation: 'Event systems and signals are built on this pattern.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How would you implement a singleton in Python?',
        answer: `The simplest way is a module: a module is imported once and every importer receives the same object, so a value created at module level is already a singleton. Where a class is required, <code>__new__</code> can be overridden to return one stored instance, or a decorator or metaclass can do the same. The module approach is preferred because it is the simplest and easiest to test.`,
      },
      {
        question: 'How is the decorator pattern related to Python decorators?',
        answer: `The decorator pattern wraps an object in another object with the same interface in order to add behaviour without changing the original class. A Python decorator, written with <code>@</code>, wraps a function or class in another function to add behaviour such as logging, caching or access checks. They share the idea of wrapping to extend, but a Python decorator is a language feature applied when the function is defined.`,
      },
    ],
  },
}
