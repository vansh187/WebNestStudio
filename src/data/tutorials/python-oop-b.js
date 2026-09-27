// Python course — object-oriented programming lessons (part 2).
// Keys are slugs matching topics in codelabDefaults.js.
export const pythonOopB = {
  'abstraction-and-abstract-base-classes': {
    title: 'Abstraction and Abstract Base Classes',
    intro: `Abstraction means exposing <em>what</em> an object does while hiding <em>how</em> it does it. You call <code>storage.save(file)</code> without caring whether it writes to disk, S3 or a database. In Python, abstraction is formalised with <strong>abstract base classes</strong> (ABCs) from the <code>abc</code> module: a base class declares methods that every subclass must implement, and Python refuses to create objects of incomplete subclasses.

This lesson covers <code>ABC</code> and <code>@abstractmethod</code>, abstract properties, template methods, and the ready-made ABCs in <code>collections.abc</code>.`,
    sections: [
      {
        heading: 'Defining an Abstract Base Class',
        body: `Inherit from <code>abc.ABC</code> and mark required methods with <code>@abstractmethod</code>. The ABC itself cannot be instantiated, and neither can any subclass that fails to implement all abstract methods — you get a <code>TypeError</code> at creation time instead of a confusing error later. Abstract methods may still contain a default implementation that subclasses call via <code>super()</code>.`,
      },
      {
        heading: 'The Template Method Pattern',
        body: `An ABC often combines concrete and abstract methods: a concrete <code>process()</code> defines the overall algorithm (validate → charge → notify) and calls abstract steps that each subclass fills in. This keeps the workflow consistent while allowing variation in the details.`,
      },
      {
        heading: 'collections.abc',
        body: `The standard library defines ABCs for common protocols: <code>Iterable</code>, <code>Sequence</code>, <code>Mapping</code>, <code>MutableMapping</code>, <code>Callable</code>, <code>Sized</code>... Inheriting from one gives you mixin methods for free — implement <code>__getitem__</code> and <code>__len__</code> in a <code>Sequence</code> subclass and you get <code>__contains__</code>, <code>__iter__</code>, <code>index</code> and <code>count</code>. They are also useful in <code>isinstance</code> checks.`,
      },
    ],
    examples: [
      {
        caption: 'An abstract base class and concrete implementations',
        code: `from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, name, data):
        """Persist data under a name."""

    @abstractmethod
    def load(self, name):
        """Return previously saved data."""

class MemoryStorage(Storage):
    def __init__(self):
        self._files = {}
    def save(self, name, data):
        self._files[name] = data
    def load(self, name):
        return self._files[name]

class IncompleteStorage(Storage):
    def save(self, name, data):
        pass

store = MemoryStorage()
store.save("notes.txt", "Learn ABCs")
print(store.load("notes.txt"))

for cls in (Storage, IncompleteStorage):
    try:
        cls()
    except TypeError as e:
        print("TypeError:", e)`,
        output: `Learn ABCs
TypeError: Can't instantiate abstract class Storage without an implementation for abstract methods 'load', 'save'
TypeError: Can't instantiate abstract class IncompleteStorage without an implementation for abstract method 'load'`,
      },
      {
        caption: 'Template method: shared workflow, varying steps',
        code: `from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    def process(self, amount):                  # concrete template method
        if amount <= 0:
            return "rejected: invalid amount"
        ref = self.charge(amount)
        return f"{self.name()} OK, ref={ref}, fee={self.fee(amount):.2f}"

    @abstractmethod
    def charge(self, amount): ...

    @abstractmethod
    def name(self): ...

    def fee(self, amount):                      # default hook, may be overridden
        return 0.0

class UpiProcessor(PaymentProcessor):
    def charge(self, amount):
        return "UPI-001"
    def name(self):
        return "UPI"

class CardProcessor(PaymentProcessor):
    def charge(self, amount):
        return "CARD-778"
    def name(self):
        return "Card"
    def fee(self, amount):
        return amount * 0.02

for p in (UpiProcessor(), CardProcessor()):
    print(p.process(1000))
print(UpiProcessor().process(0))`,
        output: `UPI OK, ref=UPI-001, fee=0.00
Card OK, ref=CARD-778, fee=20.00
rejected: invalid amount`,
      },
      {
        caption: 'Abstract properties and collections.abc',
        code: `from abc import ABC, abstractmethod
from collections.abc import Sequence, Mapping

class Shape(ABC):
    @property
    @abstractmethod
    def sides(self): ...

class Triangle(Shape):
    @property
    def sides(self):
        return 3

print(Triangle().sides)

class Deck(Sequence):
    def __init__(self):
        self._cards = [f"{r}{s}" for s in "♠♥" for r in "AKQ"]
    def __getitem__(self, i):
        return self._cards[i]
    def __len__(self):
        return len(self._cards)

deck = Deck()
print(len(deck), deck[0], "Q♥" in deck, deck.index("K♥"), list(reversed(deck))[:2])
print(isinstance({}, Mapping), isinstance(deck, Sequence))`,
        output: `3
6 A♠ True 4 ['Q♥', 'K♥']
True True`,
      },
    ],
    commonMistakes: [
      'Forgetting to inherit from ABC, so @abstractmethod is not enforced.',
      'Creating ABCs for every class "just in case" — use them where several implementations really exist.',
      'Implementing abstract methods with different signatures in subclasses.',
      'Using ABCs where a typing.Protocol (structural typing) would avoid forced inheritance.',
    ],
    keyPoints: [
      'Abstraction hides implementation behind a clear interface.',
      'ABC + @abstractmethod prevent instantiation of incomplete classes.',
      'Template methods keep a fixed workflow with overridable steps.',
      'collections.abc provides ready-made ABCs with free mixin methods.',
    ],
  },

  'magic-methods-and-operator-overloading': {
    title: 'Magic Methods and Operator Overloading',
    intro: `Magic methods — also called <strong>dunder methods</strong> because of their double underscores — let your classes integrate with Python's syntax and built-ins. Define <code>__str__</code> and <code>print()</code> shows something useful; define <code>__add__</code> and <code>+</code> works on your objects; define <code>__len__</code>, <code>__getitem__</code> and <code>__iter__</code> and your class behaves like a built-in container.

This lesson covers string representations, comparison and hashing, arithmetic operator overloading, container and iteration methods, making objects callable, and the context-manager methods.`,
    sections: [
      {
        heading: 'String Representations',
        body: `<code>__repr__</code> returns an unambiguous, developer-facing representation (ideally valid code to recreate the object) used by the REPL, debuggers and containers. <code>__str__</code> returns a friendly representation for <code>print()</code> and <code>str()</code>; it falls back to <code>__repr__</code>. <code>__format__</code> supports format specs in f-strings.`,
      },
      {
        heading: 'Comparison and Hashing',
        body: `<code>__eq__</code>, <code>__lt__</code>, <code>__le__</code>, <code>__gt__</code>, <code>__ge__</code> and <code>__ne__</code> define comparisons; <code>functools.total_ordering</code> fills in the rest from <code>__eq__</code> and one ordering method. If you define <code>__eq__</code>, define <code>__hash__</code> consistently (equal objects must have equal hashes) — or leave objects unhashable if they are mutable.`,
      },
      {
        heading: 'Arithmetic Operators',
        body: `<code>__add__</code> (+), <code>__sub__</code> (-), <code>__mul__</code> (*), <code>__truediv__</code> (/), <code>__floordiv__</code>, <code>__mod__</code>, <code>__pow__</code>, <code>__neg__</code>, <code>__abs__</code>. Reflected versions (<code>__radd__</code>, <code>__rmul__</code>) handle cases like <code>3 * vector</code>, and in-place versions (<code>__iadd__</code>) handle <code>+=</code>. Return <code>NotImplemented</code> for unsupported types so Python can try the other operand.`,
      },
      {
        heading: 'Containers, Iteration, Calling and Context Managers',
        body: `<code>__len__</code>, <code>__getitem__</code>, <code>__setitem__</code>, <code>__delitem__</code>, <code>__contains__</code> and <code>__iter__</code> make a class behave like a collection. <code>__bool__</code> controls truthiness. <code>__call__</code> makes instances callable like functions. <code>__enter__</code> and <code>__exit__</code> make objects usable in <code>with</code> statements.`,
      },
    ],
    examples: [
      {
        caption: '__repr__, __str__ and __format__',
        code: `class Money:
    def __init__(self, amount, currency="INR"):
        self.amount, self.currency = amount, currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        return f"{self.currency} {self.amount:,.2f}"

    def __format__(self, spec):
        return f"{self.amount:{spec}} {self.currency}" if spec else str(self)

m = Money(1234.5)
print(m)
print(repr(m))
print([m])
print(f"{m:.0f}")`,
        output: `INR 1,234.50
Money(1234.5, 'INR')
[Money(1234.5, 'INR')]
1234 INR`,
      },
      {
        caption: 'Operator overloading for a Vector class',
        code: `class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)
    __rmul__ = __mul__                       # supports 3 * v
    def __neg__(self):
        return Vector(-self.x, -self.y)
    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))
    def __bool__(self):
        return bool(self.x or self.y)

a, b = Vector(3, 4), Vector(1, 2)
print(a + b, a - b, a * 2, 3 * b, -a, abs(a))
print(a == Vector(3, 4), bool(Vector(0, 0)), len({a, Vector(3, 4)}))
try:
    a + 5
except TypeError as e:
    print("TypeError:", e)`,
        output: `Vector(4, 6) Vector(2, 2) Vector(6, 8) Vector(3, 6) Vector(-3, -4) 5.0
True False 1
TypeError: unsupported operand type(s) for +: 'Vector' and 'int'`,
      },
      {
        caption: 'Comparisons with total_ordering, and sorting objects',
        code: `from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, text):
        self.parts = tuple(int(p) for p in text.split("."))
    def __eq__(self, other):
        return self.parts == other.parts
    def __lt__(self, other):
        return self.parts < other.parts
    def __repr__(self):
        return ".".join(map(str, self.parts))

versions = [Version("3.12.1"), Version("3.9.0"), Version("3.12.0"), Version("3.10.4")]
print(sorted(versions))
print(Version("3.10.0") > Version("3.9.9"), Version("1.0") >= Version("1.0"), max(versions))`,
        output: `[3.9.0, 3.10.4, 3.12.0, 3.12.1]
True True 3.12.1`,
      },
      {
        caption: 'A container class, a callable object and a context manager',
        code: `class Inventory:
    def __init__(self):
        self._items = {}
    def __setitem__(self, name, qty):
        self._items[name] = qty
    def __getitem__(self, name):
        return self._items.get(name, 0)
    def __delitem__(self, name):
        del self._items[name]
    def __contains__(self, name):
        return name in self._items
    def __len__(self):
        return len(self._items)
    def __iter__(self):
        return iter(sorted(self._items))

inv = Inventory()
inv["pens"] = 40; inv["books"] = 5; inv["bags"] = 2
del inv["bags"]
print(len(inv), inv["pens"], inv["lamps"], "books" in inv, list(inv))

class Discount:
    def __init__(self, percent):
        self.percent = percent
    def __call__(self, price):
        return price * (100 - self.percent) / 100

festive = Discount(20)
print(festive(500), callable(festive))

class Timer:
    def __enter__(self):
        print("start")
        return self
    def __exit__(self, exc_type, exc, tb):
        print("stop, error:", exc_type.__name__ if exc_type else None)
        return False

with Timer():
    print("working")`,
        output: `2 40 0 True ['books', 'pens']
400.0 True
start
working
stop, error: None`,
      },
    ],
    commonMistakes: [
      'Defining __eq__ but not __hash__ for immutable value objects (Python makes them unhashable).',
      'Raising TypeError instead of returning NotImplemented from arithmetic methods.',
      'Making __repr__ vague ("<Vector>") so debugging output is useless.',
      'Overloading operators with surprising meanings (e.g. + that deletes data).',
    ],
    keyPoints: [
      '__repr__ for developers, __str__ for users, __format__ for format specs.',
      'Comparison methods plus @total_ordering make objects sortable; keep __hash__ consistent with __eq__.',
      'Arithmetic dunders (plus __r*__ and __i*__ variants) enable operator overloading.',
      '__len__, __getitem__, __contains__, __iter__ make container-like classes.',
      '__call__ makes callable objects; __enter__/__exit__ make context managers.',
    ],
  },

  'properties-and-descriptors': {
    title: 'Properties and Descriptors',
    intro: `In Python you start with plain public attributes. If you later need validation, a computed value or a read-only field, you do not have to change every caller from <code>obj.price</code> to <code>obj.get_price()</code> — you turn the attribute into a <strong>property</strong>. Properties are built on a more general mechanism, <strong>descriptors</strong>, which also power methods, <code>classmethod</code>, <code>staticmethod</code> and ORM fields.

This lesson covers <code>@property</code> with setters and deleters, computed and cached properties, and writing reusable descriptors with <code>__get__</code>, <code>__set__</code> and <code>__set_name__</code>.`,
    sections: [
      {
        heading: '@property, Setters and Deleters',
        body: `Decorating a method with <code>@property</code> makes it accessible like an attribute. Add <code>@name.setter</code> to validate or transform assigned values and <code>@name.deleter</code> for deletion. A property without a setter is read-only. Store the real value in a "private" attribute such as <code>self._price</code>.`,
      },
      {
        heading: 'Computed and Cached Properties',
        body: `Properties can compute values on the fly — <code>full_name</code> from first and last name, <code>area</code> from width and height — so derived data never goes stale. For expensive computations on objects that do not change, <code>functools.cached_property</code> computes the value once and stores it on the instance.`,
      },
      {
        heading: 'Descriptors',
        body: `A descriptor is an object stored as a class attribute that defines <code>__get__</code> (and optionally <code>__set__</code>, <code>__delete__</code>). Python calls these when the attribute is accessed on instances. <code>__set_name__</code> tells the descriptor which attribute name it was assigned to. Descriptors let you write validation once — "positive number", "non-empty string" — and reuse it across many classes and fields; this is how Django and SQLAlchemy model fields work.`,
      },
    ],
    examples: [
      {
        caption: 'Validated attributes and computed properties',
        code: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def width(self):
        return self._width

    @width.setter
    def width(self, value):
        if value <= 0:
            raise ValueError("width must be positive")
        self._width = value

    @property
    def height(self):
        return self._height

    @height.setter
    def height(self, value):
        if value <= 0:
            raise ValueError("height must be positive")
        self._height = value

    @property
    def area(self):                  # computed, read-only
        return self.width * self.height

r = Rectangle(3, 4)
print(r.area)
r.width = 10
print(r.area)
try:
    r.height = -1
except ValueError as e:
    print("ValueError:", e)
try:
    r.area = 5
except AttributeError as e:
    print("AttributeError:", e)`,
        output: `12
40
ValueError: height must be positive
AttributeError: property 'area' of 'Rectangle' object has no setter`,
      },
      {
        caption: 'Deleters and cached_property',
        code: `from functools import cached_property

class User:
    def __init__(self, first, last):
        self.first, self.last = first, last
        self._email = None

    @property
    def full_name(self):
        return f"{self.first} {self.last}"

    @property
    def email(self):
        return self._email or "not set"

    @email.setter
    def email(self, value):
        self._email = value.strip().lower()

    @email.deleter
    def email(self):
        self._email = None

class Report:
    def __init__(self, rows):
        self.rows = rows

    @cached_property
    def total(self):
        print("computing total...")
        return sum(self.rows)

u = User("Asha", "Rao")
u.email = "  Asha@Webnest.IN "
print(u.full_name, u.email)
del u.email
print(u.email)

rep = Report([10, 20, 30])
print(rep.total, rep.total)`,
        output: `Asha Rao asha@webnest.in
not set
computing total...
60 60`,
      },
      {
        caption: 'A reusable validating descriptor',
        code: `class Positive:
    def __set_name__(self, owner, name):
        self.private_name = "_" + name
        self.public_name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private_name)

    def __set__(self, obj, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.public_name} must be a positive number, got {value!r}")
        setattr(obj, self.private_name, value)

class Product:
    price = Positive()
    stock = Positive()

    def __init__(self, name, price, stock):
        self.name, self.price, self.stock = name, price, stock

p = Product("Pen", 10, 100)
print(p.price, p.stock, vars(p))
for field, value in [("price", -5), ("stock", "many")]:
    try:
        setattr(p, field, value)
    except ValueError as e:
        print("ValueError:", e)`,
        output: `10 100 {'name': 'Pen', '_price': 10, '_stock': 100}
ValueError: price must be a positive number, got -5
ValueError: stock must be a positive number, got 'many'`,
      },
    ],
    commonMistakes: [
      'Storing the value under the same name as the property (self.width inside the width setter), causing infinite recursion.',
      'Writing get_x/set_x methods everywhere instead of starting with plain attributes and switching to properties later.',
      'Using cached_property on objects whose inputs change, leaving a stale cached value.',
      'Putting slow work or side effects in properties that callers assume are cheap.',
    ],
    keyPoints: [
      '@property turns methods into attribute-style access; add .setter and .deleter as needed.',
      'Properties allow validation, read-only fields and computed values without changing callers.',
      'cached_property computes once per instance.',
      'Descriptors (__get__, __set__, __set_name__) make reusable attribute logic.',
    ],
  },

  dataclasses: {
    title: 'Dataclasses in Python',
    intro: `Many classes exist mainly to hold data: a <code>Product</code> with a name and a price, an <code>Order</code> with items and a status. Writing their <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> by hand is repetitive and error-prone. The <code>dataclasses</code> module generates them from type-annotated fields.

This lesson covers <code>@dataclass</code>, default values and <code>field()</code>, immutability with <code>frozen=True</code>, ordering, <code>__post_init__</code> validation, <code>slots</code>, keyword-only fields, and converting dataclasses to dicts.`,
    sections: [
      {
        heading: 'Basic Dataclasses',
        body: `Decorate a class with <code>@dataclass</code> and declare fields with type annotations. Python generates <code>__init__</code>, a readable <code>__repr__</code> and field-by-field <code>__eq__</code>. Type hints are documentation for tools; they are not enforced at runtime.`,
      },
      {
        heading: 'Defaults and field()',
        body: `Fields with defaults must come after fields without. Mutable defaults are forbidden directly — use <code>field(default_factory=list)</code>. <code>field()</code> also controls whether a field appears in <code>__repr__</code> (<code>repr=False</code> for secrets), in comparisons, or in <code>__init__</code> (<code>init=False</code> for computed fields).`,
      },
      {
        heading: 'Options: frozen, order, slots, kw_only',
        body: `<code>frozen=True</code> makes instances immutable and hashable — good for value objects and dict keys. <code>order=True</code> generates comparison methods using fields in order. <code>slots=True</code> uses <code>__slots__</code> for lower memory use and faster attribute access. <code>kw_only=True</code> forces keyword arguments for clearer construction.`,
      },
      {
        heading: 'Validation and Conversion',
        body: `<code>__post_init__</code> runs after the generated <code>__init__</code> — use it to validate or derive values. <code>dataclasses.asdict()</code> and <code>astuple()</code> convert to plain structures (for JSON), and <code>replace()</code> creates a modified copy. For validation and parsing of external data (API input), Pydantic models (used by FastAPI) go further.`,
      },
    ],
    examples: [
      {
        caption: 'A basic dataclass versus a hand-written class',
        code: `from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0

    def total(self) -> float:
        return self.price * self.quantity

p = Product("Pen", 10.0, 5)
print(p)
print(p == Product("Pen", 10.0, 5), p.total())
print(Product("Book", 250.0))`,
        output: `Product(name='Pen', price=10.0, quantity=5)
True 50.0
Product(name='Book', price=250.0, quantity=0)`,
      },
      {
        caption: 'field(), default_factory, __post_init__ and hidden fields',
        code: `from dataclasses import dataclass, field

@dataclass
class Order:
    order_id: str
    items: list[str] = field(default_factory=list)
    prices: list[float] = field(default_factory=list)
    api_token: str = field(default="", repr=False)
    total: float = field(init=False)

    def __post_init__(self):
        if not self.order_id.startswith("WN-"):
            raise ValueError("order id must start with WN-")
        self.total = sum(self.prices)

o = Order("WN-101", ["pen", "book"], [10, 250], api_token="secret")
print(o)
print(Order("WN-102").items is not Order("WN-103").items)
try:
    Order("101")
except ValueError as e:
    print("ValueError:", e)`,
        output: `Order(order_id='WN-101', items=['pen', 'book'], prices=[10, 250], total=260)
True
ValueError: order id must start with WN-`,
      },
      {
        caption: 'frozen, order, slots, kw_only, asdict and replace',
        code: `from dataclasses import dataclass, asdict, astuple, replace, FrozenInstanceError

@dataclass(frozen=True, order=True, slots=True)
class Version:
    major: int
    minor: int
    patch: int = 0

@dataclass(kw_only=True)
class Settings:
    theme: str = "light"
    page_size: int = 20

v1, v2 = Version(3, 12), Version(3, 9, 4)
print(sorted([v1, v2]), v1 > v2, {v1: "current"})
try:
    v1.major = 4
except FrozenInstanceError as e:
    print("FrozenInstanceError:", e)
print(replace(v1, patch=1), asdict(v1), astuple(v2))
print(Settings(page_size=50))
try:
    Settings("dark")
except TypeError as e:
    print("TypeError:", e)`,
        output: `[Version(major=3, minor=9, patch=4), Version(major=3, minor=12, patch=0)] True {Version(major=3, minor=12, patch=0): 'current'}
FrozenInstanceError: cannot assign to field 'major'
Version(major=3, minor=12, patch=1) {'major': 3, 'minor': 12, 'patch': 0} (3, 9, 4)
Settings(theme='light', page_size=50)
TypeError: Settings.__init__() takes 1 positional argument but 2 were given`,
      },
    ],
    commonMistakes: [
      'Using items: list = [] as a default (ValueError: mutable default) — use field(default_factory=list).',
      'Putting a field without a default after one with a default.',
      'Assuming type hints are enforced at runtime; validate in __post_init__ or use Pydantic.',
      'Mutating a frozen dataclass instead of using replace().',
    ],
    keyPoints: [
      '@dataclass generates __init__, __repr__ and __eq__ from annotated fields.',
      'Use field(default_factory=...) for mutable defaults; field() also controls repr/init/compare.',
      'frozen, order, slots and kw_only options tailor behaviour.',
      '__post_init__ validates or derives values; asdict/astuple/replace convert and copy.',
    ],
  },

  enums: {
    title: 'Enums in Python',
    intro: `Some values come from a small fixed set: order status (pending, paid, shipped), user role (student, instructor, admin), day of week. Using raw strings like <code>"shiped"</code> invites typos that no tool catches. An <strong>enumeration</strong> defines the allowed values once as named constants.

This lesson covers <code>Enum</code>, <code>auto()</code>, <code>StrEnum</code> and <code>IntEnum</code>, <code>Flag</code> for combinable permissions, adding methods to enums, and using enums with <code>match</code>.`,
    sections: [
      {
        heading: 'Defining and Using Enums',
        body: `Subclass <code>enum.Enum</code> and list members as class attributes. Each member has a <code>name</code> and a <code>value</code>. Access members as <code>Status.PAID</code>, by value <code>Status("paid")</code> or by name <code>Status["PAID"]</code>. Members are singletons: compare with <code>is</code> or <code>==</code>. Iterating the class yields members in definition order.`,
      },
      {
        heading: 'auto(), StrEnum and IntEnum',
        body: `<code>auto()</code> assigns values automatically. <code>StrEnum</code> (3.11+) members are also strings — they serialise naturally to JSON and compare equal to their string values; with <code>auto()</code> the value is the lowercase member name. <code>IntEnum</code> members are integers. Plain <code>Enum</code> members are deliberately not equal to raw values, which catches mix-ups.`,
      },
      {
        heading: 'Flag for Combinations',
        body: `<code>enum.Flag</code> members can be combined with <code>|</code> and tested with <code>in</code> — ideal for permissions: <code>Permission.READ | Permission.WRITE</code>.`,
      },
      {
        heading: 'Methods and Pattern Matching',
        body: `Enums are classes, so they can have methods and properties, for example <code>Status.can_cancel()</code>. They work well with <code>match</code> statements to handle each state explicitly.`,
      },
    ],
    examples: [
      {
        caption: 'Defining, accessing and iterating an Enum',
        code: `from enum import Enum

class Status(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"

s = Status.PAID
print(s, s.name, s.value)
print(Status("shipped"), Status["PENDING"])
print([m.name for m in Status])
print(s is Status.PAID, s == "paid")
try:
    Status("shiped")
except ValueError as e:
    print("ValueError:", e)`,
        output: `Status.PAID PAID paid
Status.SHIPPED Status.PENDING
['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']
True False
ValueError: 'shiped' is not a valid Status`,
      },
      {
        caption: 'auto(), StrEnum, IntEnum and JSON',
        code: `import json
from enum import Enum, IntEnum, StrEnum, auto

class Color(Enum):
    RED = auto()
    GREEN = auto()

class Role(StrEnum):
    STUDENT = auto()
    ADMIN = auto()

class Priority(IntEnum):
    LOW = 1
    HIGH = 3

print(Color.RED.value, Color.GREEN.value)
print(Role.ADMIN, Role.ADMIN == "admin", json.dumps({"role": Role.STUDENT}))
print(Priority.HIGH > Priority.LOW, Priority.HIGH + 1, sorted([Priority.HIGH, Priority.LOW]))`,
        output: `1 2
admin True {"role": "student"}
True 4 [<Priority.LOW: 1>, <Priority.HIGH: 3>]`,
      },
      {
        caption: 'Flag permissions, enum methods and match',
        code: `from enum import Enum, Flag, auto

class Permission(Flag):
    READ = auto()
    WRITE = auto()
    DELETE = auto()

editor = Permission.READ | Permission.WRITE
print(Permission.WRITE in editor, Permission.DELETE in editor)

class OrderStatus(Enum):
    PENDING = "pending"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

    def can_cancel(self):
        return self is OrderStatus.PENDING

def message(status):
    match status:
        case OrderStatus.PENDING:
            return "We are preparing your order."
        case OrderStatus.SHIPPED:
            return "Your order is on the way."
        case OrderStatus.DELIVERED:
            return "Delivered. Enjoy!"

for st in OrderStatus:
    print(f"{st.value:<10} cancel={st.can_cancel()!s:<5} {message(st)}")`,
        output: `True False
pending    cancel=True  We are preparing your order.
shipped    cancel=False Your order is on the way.
delivered  cancel=False Delivered. Enjoy!`,
      },
    ],
    commonMistakes: [
      'Comparing plain Enum members with raw strings (Status.PAID == "paid" is False) — use StrEnum or .value.',
      'Using magic strings and numbers instead of enums for fixed sets of values.',
      'Defining two members with the same value, which silently creates an alias; use @enum.unique to prevent it.',
      'Storing enum names in a database and later renaming members.',
    ],
    keyPoints: [
      'Enums define named constants for fixed sets of values.',
      'Access members by attribute, value or name; iterate the class.',
      'auto() generates values; StrEnum and IntEnum behave like str/int.',
      'Flag supports combinable options with | and in.',
      'Enums can have methods and work naturally with match.',
    ],
  },

  'composition-vs-inheritance': {
    title: 'Composition vs Inheritance',
    intro: `Inheritance models an "is-a" relationship: a <code>SavingsAccount</code> is a <code>BankAccount</code>. Composition models a "has-a" relationship: a <code>Car</code> has an <code>Engine</code>, an <code>Order</code> has a <code>PaymentMethod</code>. Experienced developers follow the guideline "favour composition over inheritance", because composed objects are easier to change, test and reuse.

This lesson compares the two approaches, shows the problems of deep inheritance, and demonstrates composition, delegation and dependency injection in Python.`,
    sections: [
      {
        heading: 'Problems with Overusing Inheritance',
        body: `Inheritance couples a child tightly to its parent's implementation: changes in the parent ripple into every subclass. Trying to express every combination through subclasses causes an explosion of classes (<code>EmailUrgentNotifier</code>, <code>SmsUrgentNotifier</code>...). Deep hierarchies are hard to follow, and a subclass inherits everything, even behaviour it should not have.`,
      },
      {
        heading: 'Composition',
        body: `With composition, an object holds references to other objects and delegates work to them. Behaviour can be swapped at runtime by passing a different component, each component is small and testable on its own, and combinations are formed by assembling objects instead of defining new classes.`,
      },
      {
        heading: 'Dependency Injection',
        body: `Passing collaborators into a class (usually through <code>__init__</code>) instead of creating them inside is called dependency injection. It lets tests pass fakes — a fake mailer instead of a real SMTP connection — and makes dependencies explicit. Frameworks such as FastAPI and Spring build on this idea.`,
      },
      {
        heading: 'When Inheritance Is Right',
        body: `Use inheritance when there is a genuine is-a relationship, the subclass can be used anywhere the parent is expected (the Liskov substitution principle), and you want to share an interface or template. Use composition for everything else.`,
      },
    ],
    examples: [
      {
        caption: 'Composition: a Car has an Engine',
        code: `class Engine:
    def __init__(self, horsepower):
        self.horsepower = horsepower
    def start(self):
        return f"{self.horsepower}hp engine started"

class ElectricMotor:
    def start(self):
        return "silent electric motor started"

class Car:
    def __init__(self, model, engine):
        self.model = model
        self.engine = engine          # has-a

    def drive(self):
        return f"{self.model}: {self.engine.start()}"

print(Car("Sedan", Engine(120)).drive())
print(Car("EV", ElectricMotor()).drive())`,
        output: `Sedan: 120hp engine started
EV: silent electric motor started`,
      },
      {
        caption: 'Avoiding a class explosion by composing behaviours',
        code: `class EmailChannel:
    def send(self, text):
        return f"[email] {text}"

class SmsChannel:
    def send(self, text):
        return f"[sms] {text}"

class UrgentFormat:
    def format(self, text):
        return f"URGENT: {text.upper()}"

class PlainFormat:
    def format(self, text):
        return text

class Notifier:
    def __init__(self, channel, formatter):
        self.channel, self.formatter = channel, formatter
    def notify(self, text):
        return self.channel.send(self.formatter.format(text))

combos = [(EmailChannel(), PlainFormat()), (SmsChannel(), UrgentFormat()), (EmailChannel(), UrgentFormat())]
for channel, fmt in combos:
    print(Notifier(channel, fmt).notify("server restarted"))`,
        output: `[email] server restarted
[sms] URGENT: SERVER RESTARTED
[email] URGENT: SERVER RESTARTED`,
      },
      {
        caption: 'Dependency injection makes testing easy',
        code: `class SmtpMailer:
    def send(self, to, body):
        raise RuntimeError("would contact a real mail server")

class FakeMailer:
    def __init__(self):
        self.sent = []
    def send(self, to, body):
        self.sent.append((to, body))

class RegistrationService:
    def __init__(self, mailer):
        self.mailer = mailer          # injected dependency
    def register(self, email):
        self.mailer.send(email, "Welcome to Webnest!")
        return f"registered {email}"

fake = FakeMailer()
service = RegistrationService(fake)
print(service.register("asha@webnest.in"))
print(fake.sent)`,
        output: `registered asha@webnest.in
[('asha@webnest.in', 'Welcome to Webnest!')]`,
      },
    ],
    commonMistakes: [
      'Using inheritance just to reuse a helper method.',
      'Creating a subclass for every combination of features.',
      'Creating dependencies inside __init__ (self.mailer = SmtpMailer()), making classes hard to test.',
      'Subclasses that break the parent\'s contract, so they cannot replace it safely.',
    ],
    keyPoints: [
      'Inheritance = is-a; composition = has-a.',
      'Favour composition: smaller, swappable, testable components.',
      'Compose behaviours instead of creating a subclass per combination.',
      'Inject dependencies through __init__ to decouple and test easily.',
      'Use inheritance for genuine is-a relationships that honour the parent\'s contract.',
    ],
  },

  'design-patterns-in-python': {
    title: 'Design Patterns in Python',
    intro: `Design patterns are proven solutions to recurring design problems, catalogued by the "Gang of Four" in 1994: creating objects flexibly, structuring relationships, and organising behaviour. Many patterns look different — often simpler — in Python, because functions are first-class objects, modules are natural singletons, and duck typing removes the need for many interfaces.

This lesson implements the most useful patterns the Pythonic way: Singleton, Factory, Builder, Adapter, Decorator, Facade, Strategy, Observer and Command, each with a runnable example.`,
    sections: [
      {
        heading: 'Creational Patterns',
        body: `<strong>Singleton</strong> ensures one instance — in Python a module-level object or a cached function is usually enough. <strong>Factory</strong> creates objects without the caller knowing the concrete class — often a dict mapping names to classes. <strong>Builder</strong> assembles complex objects step by step, often with method chaining.`,
      },
      {
        heading: 'Structural Patterns',
        body: `<strong>Adapter</strong> wraps an incompatible interface to match the one your code expects. <strong>Decorator</strong> adds behaviour to objects or functions without changing them — Python's <code>@decorator</code> syntax implements the function version directly. <strong>Facade</strong> provides one simple interface to a complex subsystem.`,
      },
      {
        heading: 'Behavioural Patterns',
        body: `<strong>Strategy</strong> selects an algorithm at runtime — in Python, just pass a function. <strong>Observer</strong> notifies subscribers when something happens (event systems, signals). <strong>Command</strong> wraps an action as an object so it can be queued, logged or undone. <strong>Iterator</strong> is built into the language through <code>__iter__</code> and generators.`,
      },
      {
        heading: 'Use Patterns Sparingly',
        body: `Patterns are a vocabulary, not a checklist. Apply one when it removes real duplication or coupling; otherwise the simplest code wins.`,
      },
    ],
    examples: [
      {
        caption: 'Singleton, Factory and Builder',
        code: `from functools import cache

@cache
def get_settings():                 # Pythonic singleton: created once, then reused
    print("loading settings")
    return {"currency": "INR"}

print(get_settings() is get_settings())

class PdfExporter:
    def export(self, data): return f"PDF({len(data)} rows)"
class CsvExporter:
    def export(self, data): return f"CSV({len(data)} rows)"

EXPORTERS = {"pdf": PdfExporter, "csv": CsvExporter}

def make_exporter(kind):            # Factory
    try:
        return EXPORTERS[kind]()
    except KeyError:
        raise ValueError(f"unknown format {kind!r}") from None

print(make_exporter("csv").export([1, 2, 3]))

class QueryBuilder:                 # Builder with method chaining
    def __init__(self, table):
        self.table, self.filters, self.limit_n = table, [], None
    def where(self, condition):
        self.filters.append(condition)
        return self
    def limit(self, n):
        self.limit_n = n
        return self
    def build(self):
        sql = f"SELECT * FROM {self.table}"
        if self.filters:
            sql += " WHERE " + " AND ".join(self.filters)
        if self.limit_n:
            sql += f" LIMIT {self.limit_n}"
        return sql

print(QueryBuilder("students").where("age > 18").where("city = 'Pune'").limit(10).build())`,
        output: `loading settings
True
CSV(3 rows)
SELECT * FROM students WHERE age > 18 AND city = 'Pune' LIMIT 10`,
      },
      {
        caption: 'Adapter, Decorator and Facade',
        code: `import functools

class LegacyPaymentApi:              # incompatible interface
    def make_payment(self, paise):
        return f"legacy paid {paise} paise"

class PaymentAdapter:                # Adapter
    def __init__(self, legacy):
        self.legacy = legacy
    def pay(self, rupees):
        return self.legacy.make_payment(int(rupees * 100))

print(PaymentAdapter(LegacyPaymentApi()).pay(49.5))

def logged(func):                    # Decorator
    @functools.wraps(func)
    def wrapper(*args):
        result = func(*args)
        print(f"{func.__name__}{args} -> {result}")
        return result
    return wrapper

@logged
def add(a, b):
    return a + b
add(2, 3)

class Inventory:
    def reserve(self, item): return f"reserved {item}"
class Billing:
    def charge(self, amount): return f"charged {amount}"
class Shipping:
    def ship(self, item): return f"shipped {item}"

class CheckoutFacade:                # Facade
    def __init__(self):
        self.inv, self.bill, self.ship = Inventory(), Billing(), Shipping()
    def place_order(self, item, amount):
        return [self.inv.reserve(item), self.bill.charge(amount), self.ship.ship(item)]

print(CheckoutFacade().place_order("book", 250))`,
        output: `legacy paid 4950 paise
add(2, 3) -> 5
['reserved book', 'charged 250', 'shipped book']`,
      },
      {
        caption: 'Strategy, Observer and Command',
        code: `# Strategy: pass the algorithm as a function
def flat_discount(price): return price - 100
def percent_discount(price): return price * 0.9
def no_discount(price): return price

def final_price(price, strategy=no_discount):
    return strategy(price)

print([final_price(1000, s) for s in (no_discount, flat_discount, percent_discount)])

# Observer: subscribers are notified of events
class EventBus:
    def __init__(self):
        self.subscribers = {}
    def subscribe(self, event, handler):
        self.subscribers.setdefault(event, []).append(handler)
    def publish(self, event, data):
        for handler in self.subscribers.get(event, []):
            handler(data)

bus = EventBus()
bus.subscribe("order_placed", lambda o: print("email sent for", o))
bus.subscribe("order_placed", lambda o: print("stock updated for", o))
bus.publish("order_placed", "WN-101")

# Command: actions as objects that can be undone
class AddText:
    def __init__(self, doc, text):
        self.doc, self.text = doc, text
    def execute(self):
        self.doc.append(self.text)
    def undo(self):
        self.doc.pop()

doc, history = [], []
for word in ["Hello", "Python", "World"]:
    cmd = AddText(doc, word)
    cmd.execute()
    history.append(cmd)
history.pop().undo()
print(doc)`,
        output: `[1000, 900, 900.0]
email sent for WN-101
stock updated for WN-101
['Hello', 'Python']`,
      },
    ],
    commonMistakes: [
      'Porting Java-style patterns literally (interfaces, getInstance()) where a function or module suffices.',
      'Adding patterns before there is a real need, making simple code complex.',
      'Implementing Singleton with global mutable state that makes testing hard.',
      'Confusing the Decorator pattern with Python decorators — related ideas, different scopes.',
    ],
    keyPoints: [
      'Creational: Singleton (module/cached function), Factory (dict of classes), Builder (chaining).',
      'Structural: Adapter, Decorator (@ syntax), Facade.',
      'Behavioural: Strategy (pass functions), Observer (event bus), Command (undoable actions).',
      'Python\'s first-class functions and duck typing simplify many patterns.',
      'Use patterns to solve real problems, not by default.',
    ],
  },
}
