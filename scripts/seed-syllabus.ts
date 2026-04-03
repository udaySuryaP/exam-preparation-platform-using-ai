import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COURSE_ID = "ca57877f-3b37-4220-aa70-9cf83cb549db";

const SYLLABUS_DATA = [
    {
        course_id: COURSE_ID,
        course_code: "PBCST304",
        course_name: "Object Oriented Programming",
        semester: 3,
        modules: [
            {
                module_number: 1,
                title: "Introduction to Java and OOP Concepts",
                hours: 9,
                topics: [
                    {
                        name: "Introduction to Java and Java Environment",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Introduction to Java and Java Environment\n\nJava was developed by James Gosling at Sun Microsystems in 1995. It is based on "Write Once, Run Anywhere" — Java bytecode runs on any device with a JVM. Java is high-level, object-oriented, class-based.\n\nJava Program Structure: Documentation Section (comments), Package Statement, Import Statements, Interface Statement, Class Definition with main method (public static void main(String[] args)).\n\nJDK (Java Development Kit): Complete toolset — javac (compiler), java (launcher), javadoc, jar. JRE (Java Runtime Environment): JVM + class libraries needed to run programs. JVM (Java Virtual Machine): Executes bytecode, provides platform independence.\n\nJava Compiler (javac): Converts .java source to .class bytecode through: Parse → Enter → Attribute → Flow → Desugar → Generate stages.\n\nJava Platforms: Java SE (desktop/server), Java EE (enterprise/large-scale), Java ME (mobile), JavaFX (rich internet apps).\n\nSetup: Install JDK, set JAVA_HOME, add bin to PATH. Verify: java -version, javac -version. IDEs (IntelliJ IDEA, Eclipse) provide code completion, debugging, project management.`,
                    },
                    {
                        name: "Java Virtual Machine and Bytecode",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Java Virtual Machine and Bytecode\n\nJVM is an abstract machine that executes Java bytecode. Same bytecode runs on Windows, Linux, macOS through their JVM implementations — this is platform independence.\n\nJVM Architecture:\n- Class Loader: Loads .class files — Loading, Linking (Verification + Preparation), Initialization\n- Method Area: Class-level info and static variables (shared)\n- Heap Area: All object instances (shared)\n- Stack Area: Per-thread, contains stack frames for method calls and local variables\n- PC Registers: Address of current executing instruction per thread\n- Native Method Stacks: For C/C++ native method calls\n- Execution Engine: Interpreter (line-by-line), JIT Compiler (compiles hot bytecode to native for speed), Garbage Collector (destroys unreferenced objects)\n- JNI: Interface to native C/C++ libraries\n\nBytecode: Source (.java) → javac → bytecode (.class) → JVM → machine code. Bytecode is NOT machine code — needs JVM. This is Java's platform independence secret.`,
                    },
                    {
                        name: "Primitive Data Types and Wrapper Classes",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Primitive Data Types and Wrapper Classes\n\n8 Primitive Data Types:\n- byte: 8-bit signed, -128 to 127\n- short: 16-bit signed\n- int: 32-bit signed, most common\n- long: 64-bit signed, suffix L (e.g. 100L)\n- float: 32-bit floating point, suffix f (e.g. 3.14f)\n- double: 64-bit floating point, default for decimals\n- char: 16-bit Unicode (e.g. 'A')\n- boolean: true or false\n\nWrapper Classes: Boolean, Byte, Character, Short, Integer, Long, Float, Double. Allow primitives to be used as objects. Needed for: Java Collections (ArrayList only stores objects), Generics (List<Integer> not List<int>), null values (primitives can't be null), utility methods (Integer.parseInt(), Integer.MAX_VALUE).\n\nType Casting:\n- Widening (implicit/automatic): byte→short→int→long→float→double\n- Narrowing (explicit): requires cast operator: int x = (int) 9.99;\n\nAutoboxing: Primitive automatically converted to wrapper. Integer obj = 42;\nUnboxing: Wrapper automatically converted to primitive. int x = obj;`,
                    },
                    {
                        name: "Arrays, Strings, and Vector Class",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Arrays, Strings, and Vector Class\n\nArrays: Group of same-type variables under one name. Index starts at 0, last index = length-1.\n- Declaration: int[] arr; or int arr[];\n- Creation: arr = new int[5];\n- Initialization: int[] arr = {1,2,3,4,5};\n- Multidimensional: int[][] matrix = new int[3][4]; (3 rows, 4 cols)\n- Fixed size, dynamically allocated in heap.\n\nStrings: Sequence of characters. java.lang.String class (auto-imported).\n- Literal: String s = "Hello"; (string pool)\n- Object: String s = new String("Hello"); (heap)\n- Strings are IMMUTABLE — operations create new String objects.\n- Methods: length(), charAt(), substring(), equals(), contains(), toUpperCase(), trim()\n\nVector Class: Dynamic array in java.util. Grows/shrinks in size unlike arrays. No fixed size limit.\n- Creation: Vector<String> v = new Vector<>();\n- Add: v.add("element"); v.add(index, "element"); v.addAll(v2);\n- Access: v.get(index); v.iterator();\n- Vector is synchronized (thread-safe). Use when thread safety needed; use ArrayList otherwise.`,
                    },
                    {
                        name: "Operators and Operator Precedence",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Operators and Operator Precedence\n\nJava Operator Types:\n1. Arithmetic: + - * / % ++ --\n2. Relational: == != > < >= <= (return boolean)\n3. Bitwise: & | ^ ~ << >> >>> (operate on bits)\n4. Logical: && (AND) || (OR) ! (NOT) — for boolean expressions\n5. Assignment: = += -= *= /= %= &= |=\n6. Ternary: condition ? value_if_true : value_if_false\n   Example: int max = (a > b) ? a : b;\n\nOperator Precedence (high to low):\nPostfix (x++, x--) → Unary (++x, !x, -x) → Multiplicative (* / %) → Additive (+ -) → Shift → Relational → Equality (== !=) → Bitwise AND (&) → Bitwise XOR (^) → Bitwise OR (|) → Logical AND (&&) → Logical OR (||) → Ternary (?:) → Assignment (= += -=)\n\nAssociativity: Most operators left-to-right. Assignment and ternary are right-to-left.\n\nPre vs Post increment: ++x changes then uses. x++ uses then changes.`,
                    },
                    {
                        name: "Control Statements — Selection, Iteration, Jump",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Control Statements — Selection, Iteration, Jump\n\nSelection Statements:\n- if: executes if condition true\n- if-else: if true → if block, else → else block\n- Nested if-else: if inside if\n- if-else-if ladder: chain of conditions\n- switch-case: matches expression to cases. Use break to exit each case. Default for no match. Preferred for multiple discrete values.\n\nIteration Statements:\n- while: checks condition first, may run 0 times\n- do-while: runs body first, checks condition after — runs at least once\n- for: for(init; condition; increment) — use when iterations known\n- for-each: for(type var : collection) — iterate arrays/collections\n- Labeled loops: break/continue with label to control outer loops\n\nJump Statements:\n- break: exits current loop or switch immediately\n- continue: skips rest of current iteration, goes to next\n- return: exits method, optionally returns value\n\nwhile vs do-while: while checks condition first (0 or more iterations). do-while checks after body (always at least 1 iteration).`,
                    },
                    {
                        name: "Methods, Command Line Arguments, Varargs",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Methods, Command Line Arguments, Varargs\n\nMethods in Java: Named block performing specific task. Syntax: returnType methodName(params) { body }\n- Instance methods: need object to call\n- Static methods: belong to class, call without object using ClassName.methodName()\n- Abstract methods: no body, declared in abstract class\n- Void methods: no return value\n\nCommand Line Arguments: Passed when running program from terminal. Stored as String[] in main method's args parameter.\nExample: java MyProgram Hello 42 → args[0]="Hello", args[1]="42"\nConvert to int: Integer.parseInt(args[0])\n\nVariable Length Arguments (Varargs): Method accepts variable number of arguments using ... notation.\nSyntax: returnType methodName(dataType... argName)\nExample: int sum(int... nums) — call as sum(1), sum(1,2,3), sum(1,2,3,4)\nInternally treated as array. Only one vararg per method, must be last parameter.\n\nParameter passing: Primitives passed by value (copy, original unchanged). Objects passed by reference (address passed, changes affect original). Reassigning reference inside method does not affect original.`,
                    },
                    {
                        name: "Classes, Abstract Classes, Interfaces and OOP Concepts",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 1: Introduction to Java and OOP Concepts\nTopic: Classes, Abstract Classes, Interfaces and OOP Concepts\n\nClass: Blueprint for objects. Contains fields and methods. Objects created with new keyword.\nObject: Instance of class with state (fields) and behavior (methods). Stored in heap.\n\nFour Pillars of OOP:\n1. Abstraction: Hide implementation, show only essential features. Abstract classes and interfaces.\n2. Encapsulation: Bind data and methods together. Private fields + public getters/setters. Data hiding.\n3. Inheritance: Child class acquires parent class properties. Uses extends. Promotes code reuse.\n4. Polymorphism: One interface, many implementations. Overloading (compile-time) + Overriding (runtime).\n\nAbstract Class: Cannot instantiate. Has abstract methods (no body) + concrete methods. Subclass must implement all abstract methods.\n\nInterface: Contract. All methods implicitly public abstract (pre-Java 8). Java 8+ adds default and static methods. Fields are public static final. Implemented with implements. Supports multiple inheritance.\n\n| Feature | Class | Abstract Class | Interface |\n|---|---|---|---|\n| Instantiate | Yes | No | No |\n| Constructors | Yes | Yes | No |\n| Fields | Any | Any | public static final |\n| Inheritance | Single | Single | Multiple |\n\nConstructors: Same name as class, no return type. Auto-called on new.\n- Default: compiler-provided, zero-arg\n- No-arg: explicitly written, no params\n- Parameterized: takes params for custom init\n\nAccess Modifiers:\n- private: same class only\n- default: same package only\n- protected: same package + subclasses anywhere\n- public: everywhere\n\nthis keyword: Current object reference. this.field (distinguish from param), this() (call another constructor), pass current object as arg.\n\nMicroservices: App built as small independent services, each handling one function, communicating via REST APIs. Tools: Spring Boot, Docker, Kubernetes.`,
                    },
                ],
            },
            {
                module_number: 2,
                title: "Polymorphism and Inheritance",
                hours: 9,
                topics: [
                    {
                        name: "Method Overloading and Constructor Overloading",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Method Overloading and Constructor Overloading\n\nMethod Overloading: Multiple methods in same class with same name but different parameter lists. Compile-time (static) polymorphism.\n\nWays to overload:\n1. Different number of arguments: void test() and void test(int a)\n2. Different data types: void test(int a) and void test(double a)\n3. Different order: void test(int a, double b) and void test(double a, int b)\n\nNOTE: Return type alone cannot differentiate overloaded methods — causes compile error.\n\nAdvantage: Code cleanliness, readability, flexibility.\n\nConstructor Overloading: Multiple constructors with different parameters. Call one from another using this() — must be first statement.\n\nExample:\nclass Box {\n  Box() { width = height = depth = -1; }        // no dimensions\n  Box(double w, double h, double d) {            // all dimensions\n    width=w; height=h; depth=d;\n  }\n}\n\nValid/Invalid cases:\nint myMethod(int a, int b, float c)  vs  int myMethod(int x, int y, float z)\n→ INVALID — same parameter types, just different names — compile error.\n\nMethod overloading increases readability. The compiler picks the right method based on argument types at compile time.`,
                    },
                    {
                        name: "Using Objects as Parameters and Returning Objects",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Using Objects as Parameters and Returning Objects\n\nPassing Objects as Parameters: A method can receive objects as arguments. In Java, the object reference is passed by value — changes to the object's fields inside the method DO affect the original object (because same reference points to same heap memory). But reassigning the reference variable itself inside the method does NOT affect the original.\n\nExample:\nvoid change(Operator op) {\n    op.data = op.data * 300;  // affects original object\n}\n\nReturning Objects: Methods can return objects. Useful for creating modified copies, builder patterns, method chaining.\n\nExample:\nclass ObjectReturnDemo {\n    int a;\n    ObjectReturnDemo(int a) { this.a = a; }\n    ObjectReturnDemo incrByTen() {\n        ObjectReturnDemo temp = new ObjectReturnDemo(a + 10);\n        return temp;  // returns new object\n    }\n}\n// Usage:\nob2 = ob1.incrByTen();  // ob2.a = ob1.a + 10`,
                    },
                    {
                        name: "Recursion",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Recursion\n\nRecursion: A method that calls itself to solve a problem by breaking it into smaller sub-problems. Must have: (1) Base case — termination condition to stop recursion. (2) Recursive case — calls itself with smaller problem.\n\nSyntax:\nreturnType methodName() {\n    if (baseCondition) return value;  // base case\n    return methodName();  // recursive case\n}\n\nFactorial Example:\nstatic int factorial(int n) {\n    if (n == 1) return 1;           // base case\n    return n * factorial(n - 1);    // recursive case\n}\nfactorial(5) = 5 * 4 * 3 * 2 * 1 = 120\n\nStack trace: Each call creates new stack frame. factorial(5) → factorial(4) → factorial(3) → factorial(2) → factorial(1) returns 1 → unwinds.\n\nToo deep recursion = StackOverflowError.\n\nAdvantages: Elegant for tree traversal, Fibonacci, binary search, solving complex problems simply.\nDisadvantages: More memory (stack frames), potentially slower than iterative solutions.`,
                    },
                    {
                        name: "Static Members and Final Variables",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Static Members and Final Variables\n\nStatic Variables: Shared across ALL instances of a class. Gets memory once at class loading. Used for common property (e.g., college name for all students).\nAdvantage: Memory efficient — one copy regardless of number of objects.\nExample: static String college = "KTU"; — all Student objects share same college value.\n\nStatic Methods: Belong to the class. Callable without object: ClassName.methodName().\nRestrictions: Cannot use non-static data members directly. Cannot use this or super keywords.\nCan access and modify only static members.\n\nFinal Variables: Value cannot be changed after assignment — acts as constant.\n- Initialized at declaration: final int MAX = 100;\n- Blank final: declared without value, must be initialized in constructor.\n- Static final: class-level constant — initialized in static block if not at declaration.\nExample: static final double PI = 3.14159;\n\nFinal Methods: Can be inherited but CANNOT be overridden by subclasses.\nFinal Classes: CANNOT be extended/subclassed. Example: Java's String class is final.\n\nKey rule: final + static final variable value never changes. static variable is shared but can change.`,
                    },
                    {
                        name: "Inner Classes",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Inner Classes\n\nInner Classes (Nested Classes): A class defined within another class. Groups related classes, improves readability and maintainability.\n\nExample:\nclass OuterClass {\n    int x = 10;\n    class InnerClass {\n        int myInnerMethod() { return x; }  // accesses outer's private members\n    }\n}\n// Access:\nOuterClass outer = new OuterClass();\nOuterClass.InnerClass inner = outer.new InnerClass();\nSystem.out.println(inner.myInnerMethod()); // 10\n\nTypes of Nested Classes:\n1. Regular inner class: non-static, tied to outer object, can access all outer members\n2. Static nested class: declared static, accessed without outer object instance\n3. Local class: defined inside a method, scope limited to that method\n4. Anonymous class: no name, defined and instantiated in one expression, used for one-time use implementations (common for event listeners)\n\nBenefit: Inner class can access all members (including private) of outer class. Commonly used for implementing helper classes, event handlers, iterators.`,
                    },
                    {
                        name: "Inheritance — Types, super keyword, protected, Constructor Order",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Inheritance — Types, super keyword, protected, Constructor Order\n\nInheritance: Child/derived/subclass acquires properties and methods of parent/base/superclass using extends keyword. Promotes code reuse — extend existing class without modifying it.\n\nTypes of Inheritance in Java:\n1. Single: One child extends one parent (A → B)\n2. Multilevel: Chain — A → B → C\n3. Hierarchical: Multiple children extend one parent (A → B, A → C)\n4. Multiple: NOT supported with classes (diamond problem). Supported with interfaces.\n5. Hybrid: Combination of above.\n\nsuper keyword:\n- super.method(): calls parent class version of overridden method\n- super.field: accesses parent field hidden by child\n- super(): calls parent constructor — MUST be first statement in child constructor\n- If super() not written, compiler inserts super() (no-arg) automatically\n\nprotected Members: Accessible within same package AND in subclasses in any package. More open than private (same class only), less than public (everywhere).\n\nConstructor Calling Order: Parent constructor always runs before child constructor.\n1. When child object created with new\n2. Parent no-arg constructor executes first (automatically)\n3. Then child constructor body executes\n\nTo call parameterized parent constructor: super(params) must be first line.\nExample: Derived(int x, int y) { super(x); this.y = y; }`,
                    },
                    {
                        name: "Method Overriding and Dynamic Method Dispatch",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Method Overriding and Dynamic Method Dispatch\n\nMethod Overriding: Child class declares method with SAME name and SAME parameters as parent class method. Provides specific implementation in child. Runtime (dynamic) polymorphism.\n\nRules:\n- Same method name, same parameters, same return type (or covariant)\n- Access modifier cannot be more restrictive than parent's\n- Cannot override final or static methods\n- Use @Override annotation (best practice)\n\nExample:\nclass Animal { void sound() { System.out.println("Animal sound"); } }\nclass Cat extends Animal { void sound() { System.out.println("Cat meows"); } }\nCat c = new Cat();\nc.sound(); // Output: Cat meows  (overriding)\n\nDynamic Method Dispatch (Runtime Polymorphism): When PARENT reference holds CHILD object, method called is determined at RUNTIME based on ACTUAL object type (not reference type).\n\nExample:\nAnimal a = new Cat();  // parent ref, child object\na.sound();  // Calls Cat's sound() at runtime — "Cat meows"\n\nOverloading vs Overriding:\n| Feature | Overloading | Overriding |\n|---|---|---|\n| Class | Same class | Parent + child |\n| Parameters | Different | Same |\n| Polymorphism | Compile-time | Runtime |\n| Return type | Can differ | Must match |\n| Access modifier | Can differ | Cannot restrict |`,
                    },
                    {
                        name: "Java Interface and final with Inheritance",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 2: Polymorphism and Inheritance\nTopic: Java Interface and final with Inheritance\n\nJava Interface: Blueprint for classes to achieve abstraction and multiple inheritance. Methods are implicitly public abstract. Variables are implicitly public static final.\n\nDefining:\ninterface Animal {\n    void animalSound();  // abstract\n    void sleep();\n}\n\nImplementing:\nclass Pig implements Animal {\n    public void animalSound() { System.out.println("wee wee"); }\n    public void sleep() { System.out.println("Zzz"); }\n}\n\nInterface reference (runtime polymorphism):\nAnimal a = new Pig();\na.animalSound(); // calls Pig's implementation at runtime\n\nMultiple inheritance via interfaces:\ninterface A { void showA(); }\ninterface B { void showB(); }\nclass C implements A, B { /* implement both */ }  // valid!\n\nExtending interfaces: interface C extends A, B { }  // interface can extend multiple interfaces\n\nJava does NOT support multiple class inheritance (diamond problem ambiguity) but DOES support multiple interface inheritance.\n\nfinal with Inheritance:\n- final method: inherited but CANNOT be overridden\n- final class: CANNOT be extended. Example: String, Integer are final classes in Java\n- final variable: value cannot change after assignment\n\nImportant: final vs finally vs finalize:\n- final: keyword for constants/preventing override/extension\n- finally: block in exception handling that always executes\n- finalize(): method called by JVM before garbage collection (deprecated in Java 9+)`,
                    },
                ],
            },
            {
                module_number: 3,
                title: "Packages, Interfaces, Exception Handling, and Design Patterns",
                hours: 9,
                topics: [
                    {
                        name: "Packages — Defining, CLASSPATH, Access Protection, Importing",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 3: Packages, Interfaces, Exception Handling, and Design Patterns\nTopic: Packages — Defining, CLASSPATH, Access Protection, Importing\n\nPackages: Namespace mechanism grouping related classes and interfaces. Like folders in a file system. Prevents naming conflicts, improves maintainability and reusability.\n\nTypes:\n1. Built-in Packages (Java API): java.lang (auto-imported — String, Math, Object), java.util (collections, Scanner, Date), java.io (I/O), java.net (networking), javax.swing (GUI)\n2. User-defined Packages: Created with package keyword as FIRST statement in .java file. Convention: reverse domain (com.ktu.project)\n\nDefining a Package:\npackage com.ktu.oops;\npublic class MyClass { }\n\nCLASSPATH: Environment variable telling JVM where to find .class files and packages. Must include root directory of your package structure.\n\nAccess Protection Summary:\n- public: any class, any package\n- protected: same package + subclasses any package\n- default (no modifier): same package only\n- private: same class only\n\nImporting:\n- Single class: import java.util.Scanner;\n- Entire package: import java.util.*;\n- Static import: import static java.lang.Math.PI; (use PI directly)\n- java.lang is auto-imported — no need to import String, Math, System etc.`,
                    },
                    {
                        name: "Interfaces — vs Abstract Classes, Implementing, Extending",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 3: Packages, Interfaces, Exception Handling, and Design Patterns\nTopic: Interfaces — vs Abstract Classes, Implementing, Extending\n\nInterface vs Abstract Class:\n| Feature | Interface | Abstract Class |\n|---|---|---|\n| Methods | Abstract + Default (Java 8+) | Abstract + Concrete |\n| Variables | public static final only | Any type |\n| Constructors | No | Yes |\n| Inheritance | Multiple interfaces | Single class |\n| Use case | Unrelated classes sharing behavior | Related classes sharing code |\n\nDefining Interface:\ninterface Animal {\n    void animalSound();  // implicitly public abstract\n    void sleep();\n}\n\nImplementing Interface (implements keyword):\nclass Pig implements Animal {\n    public void animalSound() { System.out.println("wee wee"); }\n    public void sleep() { System.out.println("Zzz"); }\n}\n\nAccessing via interface reference:\nAnimal a = new Pig();  // runtime polymorphism\na.animalSound();       // calls Pig's implementation\n\nExtending Interfaces:\ninterface C extends A, B { }  // interface can extend multiple interfaces\n\nDefault Methods (Java 8+): Methods with body in interface using default keyword. Implementing classes inherit or override.\n\nWhen to use interface: Unrelated classes sharing behavior, when multiple inheritance needed.\nWhen to use abstract class: Related classes sharing common code and state.`,
                    },
                    {
                        name: "Exception Handling — try, catch, finally, throw, throws, Custom Exceptions",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 3: Packages, Interfaces, Exception Handling, and Design Patterns\nTopic: Exception Handling — try, catch, finally, throw, throws, Custom Exceptions\n\nException: Unwanted event during runtime disrupting normal program flow. An exception object is created with name, description, and program state when an exception occurs.\n\nHierarchy: Throwable → Error (serious, unrecoverable: OutOfMemoryError, StackOverflowError) and Exception (recoverable) → RuntimeException (unchecked) and other checked exceptions.\n\nChecked Exceptions: Compiler forces handling or declaration. Examples: IOException, SQLException, FileNotFoundException.\nUnchecked Exceptions (RuntimeException): Not checked at compile time. Examples: NullPointerException, ArrayIndexOutOfBoundsException, ClassCastException, ArithmeticException, NumberFormatException.\n\ntry-catch-finally:\ntry {\n    // risky code\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n} catch (Exception e) {\n    System.out.println("General error");\n} finally {\n    System.out.println("Always runs — use for cleanup");\n}\n\nMultiple catch: More specific exceptions BEFORE general. catch(Exception) must be last.\n\nNested try: try block within another try.\n\nthrow: Manually throw exception: throw new ArithmeticException("Division by zero");\n\nthrows: Method declares it might throw: public void read() throws IOException { }\n\nCustom Exceptions: Extend Exception class:\nclass MyException extends Exception {\n    MyException(String msg) { super(msg); }\n}\n// Usage: throw new MyException("Custom error");`,
                    },
                    {
                        name: "Design Patterns — Singleton and Adapter",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 3: Packages, Interfaces, Exception Handling, and Design Patterns\nTopic: Design Patterns — Singleton and Adapter\n\nDesign Patterns: Proven, reusable solutions to common software design problems. Make code maintainable, scalable, and efficient.\n\nSingleton Pattern: Ensures a class has ONLY ONE instance. Provides global point of access.\nUse cases: Database connections, configuration settings, logging, thread pools.\n\nImplementation (3 steps):\npublic class Singleton {\n    private static Singleton instance;   // Step 1: private static instance\n    private Singleton() { }              // Step 2: private constructor (prevent new)\n    public static Singleton getInstance() {  // Step 3: public access method\n        if (instance == null) {\n            instance = new Singleton();  // lazy initialization\n        }\n        return instance;\n    }\n}\n// Usage:\nSingleton s1 = Singleton.getInstance();\nSingleton s2 = Singleton.getInstance();\n// s1 == s2 → true, both point to same instance\n\nAdapter Pattern: Makes incompatible interfaces work together. Converts one interface to another expected by client. Like a power plug adapter.\nUse cases: Integrating legacy code, working with third-party libraries.\n\nImplementation:\ninterface Target { void request(); }         // client expects this\nclass Adaptee { void specificRequest() { } } // incompatible\nclass Adapter implements Target {            // bridge\n    private Adaptee adaptee;\n    public void request() { adaptee.specificRequest(); }\n}\n\n| Pattern | Purpose | When to use |\n|---|---|---|\n| Singleton | One instance | Config, DB connection, logging |\n| Adapter | Convert interfaces | Legacy code, third-party libs |`,
                    },
                ],
            },
            {
                module_number: 4,
                title: "SOLID Principles, Swings, Event Handling, and JDBC",
                hours: 9,
                topics: [
                    {
                        name: "SOLID Principles in Java",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 4: SOLID Principles, Swings, Event Handling, and JDBC\nTopic: SOLID Principles in Java\n\nSOLID: Five object-oriented design principles for maintainable, scalable, understandable software.\n\n1. S — Single Responsibility Principle (SRP): A class should have only ONE reason to change. Each class does one thing. Example: UserService handles user logic, EmailService handles emails — not one class doing both.\n\n2. O — Open/Closed Principle (OCP): Open for extension, closed for modification. Add new functionality by extending, not changing existing code. Use inheritance/interfaces.\n\n3. L — Liskov Substitution Principle (LSP): Subclass objects should be replaceable for parent class objects without breaking the program. If B extends A, wherever A is used, B must work correctly.\n\n4. I — Interface Segregation Principle (ISP): Don't force a class to implement interfaces it doesn't use. Better many small specific interfaces than one large general interface.\n\n5. D — Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces). Reduces tight coupling.\n\nBenefits: Easier to test, maintain, extend, understand. Reduces technical debt. Makes codebase robust over time.`,
                    },
                    {
                        name: "Swings — AWT vs Swing, MVC, Components, Containers, Layout Managers",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 4: SOLID Principles, Swings, Event Handling, and JDBC\nTopic: Swings — AWT vs Swing, MVC, Components, Containers, Layout Managers\n\nAWT (Abstract Window Toolkit): Platform-dependent, heavy-weight GUI. Uses OS native code. Developed 1995. Limited components.\n\nSwing: Lightweight, platform-independent GUI. Part of Java Foundation Classes (JFC). All in javax.swing. Pure Java — same look on all platforms.\n\nAWT vs Swing:\n| Feature | AWT | Swing |\n|---|---|---|\n| Weight | Heavy-weight | Light-weight |\n| Platform dependent | Yes | No |\n| Components | Limited | Rich set (J-prefix) |\n| Look and Feel | OS native | Pluggable (MVC) |\n| Package | java.awt | javax.swing |\n\nMVC in Swing: Model (data) + View (visual display) + Controller (handles input, updates model/view). Separates data from presentation.\n\nKey Swing Components:\n- JFrame: Top-level window with title bar and border\n- JPanel: Generic container for grouping components\n- JLabel: Displays text or image\n- JButton: Clickable button that triggers action\n- JTextField: Single-line text input\n- JPasswordField: Hides characters (passwords)\n- JTextArea: Multi-line text area\n- JCheckBox: On/off toggle (multiple selections)\n- JRadioButton: Single selection from group\n- JComboBox: Drop-down selection list\n- JList: Scrollable list\n- JDialog: Pop-up dialog window\n- JTable: Tabular data display\n- JTree: Hierarchical data display\n\nComponent vs Container:\n- Component: Visible GUI element (JButton, JLabel). Inherits java.awt.Component.\n- Container: Holds other components. Inherits java.awt.Container. Uses Layout Managers.\n\nLayout Managers (arrange components in container):\n- FlowLayout: left-to-right, wraps (default for JPanel)\n- BorderLayout: North/South/East/West/Center (default for JFrame)\n- GridLayout: equal-sized grid cells\n- BoxLayout: single row or column\n\nSwing Packages: javax.swing (core), javax.swing.event (events), javax.swing.border (borders), javax.swing.table (JTable), javax.swing.tree (JTree).`,
                    },
                    {
                        name: "Event Handling — Delegation Model, Event Classes, Listeners",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 4: SOLID Principles, Swings, Event Handling, and JDBC\nTopic: Event Handling — Delegation Model, Event Classes, Listeners\n\nEvent Handling: Mechanism for program to respond to user actions (clicks, key presses, mouse movements).\n\nDelegation Event Model: Java's standard event handling approach. Event source generates event and DELEGATES it to registered listener objects.\n\nThree Components:\n1. Event Source: Object generating the event (e.g., JButton being clicked)\n2. Event Object: Contains event information. Examples: ActionEvent, MouseEvent, KeyEvent, ItemEvent, WindowEvent, FocusEvent\n3. Event Listener: Receives and handles event. Implements listener interface.\n\nCommon Listener Interfaces:\n- ActionListener: button clicks → actionPerformed(ActionEvent e)\n- MouseListener: mouse events → mouseClicked(), mousePressed(), mouseReleased(), mouseEntered(), mouseExited()\n- KeyListener: keyboard → keyPressed(KeyEvent e), keyReleased(), keyTyped()\n- ItemListener: checkbox/combobox changes → itemStateChanged(ItemEvent e)\n- WindowListener: window events → windowClosing(), windowOpened(), windowIconified()\n\nUsing Delegation Model (4 steps):\n1. Create event source: JButton btn = new JButton("Click");\n2. Implement listener (or use lambda): ActionListener listener = e -> { /* handle */ };\n3. Register listener with source: btn.addActionListener(listener);\n4. JVM calls listener method automatically when event occurs\n\nExample:\nJButton button = new JButton("Submit");\nbutton.addActionListener(e -> {\n    System.out.println("Button clicked!");\n});\n\nSources of Events: JButton (action), JTextField (action, focus), JCheckBox (item), JComboBox (item, action), JFrame (window events), Mouse (mouse events), Keyboard (key events).`,
                    },
                    {
                        name: "JDBC — Overview, Driver Types, Steps, CRUD Operations",
                        description: `Course: Object Oriented Programming (PBCST304) — Semester 3\nModule 4: SOLID Principles, Swings, Event Handling, and JDBC\nTopic: JDBC — Overview, Driver Types, Steps, CRUD Operations\n\nJDBC (Java Database Connectivity): Java API for connecting to and executing queries on relational databases. java.sql package. Works with MySQL, PostgreSQL, Oracle, SQLite.\n\nJDBC Driver Types:\n1. Type 1 — JDBC-ODBC Bridge: Converts JDBC to ODBC. Platform-dependent. Not recommended.\n2. Type 2 — Native API: Uses database-native libraries. Platform-dependent.\n3. Type 3 — Network Protocol: Uses middleware server. Database-independent.\n4. Type 4 — Thin Driver (Pure Java): Converts JDBC directly to DB protocol. Platform-independent. MOST COMMONLY USED. Example: MySQL Connector/J.\n\n6 Steps to Connect to Database:\n1. Load Driver: Class.forName("com.mysql.jdbc.Driver");\n2. Establish Connection: Connection con = DriverManager.getConnection(url, user, pass);\n3. Create Statement: Statement stmt = con.createStatement();\n4. Execute Query: ResultSet rs = stmt.executeQuery("SELECT * FROM students");\n5. Process Results: while(rs.next()) { String name = rs.getString("name"); }\n6. Close Connection: rs.close(); stmt.close(); con.close();\n\nJDBC Components:\n- DriverManager: Manages drivers, creates connections\n- Connection: Represents open DB connection\n- Statement: Executes simple SQL\n- PreparedStatement: Pre-compiled SQL with ? parameters (prevents SQL injection, better performance)\n- ResultSet: Holds query results, cursor-based iteration with next()\n\nCRUD with JDBC:\n- Create: stmt.executeUpdate("INSERT INTO students VALUES (1, 'John')");\n- Read: ResultSet rs = stmt.executeQuery("SELECT * FROM students");\n- Update: stmt.executeUpdate("UPDATE students SET name='Jane' WHERE id=1");\n- Delete: stmt.executeUpdate("DELETE FROM students WHERE id=1");\n\nPreparedStatement (recommended):\nPreparedStatement ps = con.prepareStatement("INSERT INTO students VALUES (?,?)");\nps.setInt(1, 1);\nps.setString(2, "John");\nps.executeUpdate();\n\nSQL Basics for JDBC:\nCREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50), marks FLOAT);\nSELECT * FROM students WHERE marks > 60;\nSELECT name, marks FROM students ORDER BY marks DESC;`,
                    },
                ],
            },
        ],
    },
];

interface Topic {
    name: string;
    description: string;
}
interface Module {
    module_number: number;
    title: string;
    hours: number;
    topics: Topic[];
}
interface CourseEntry {
    course_id: string;
    course_code: string;
    course_name: string;
    semester: number;
    modules: Module[];
}

interface Chunk {
    content: string;
    metadata: {
        course_id: string;
        course_code: string;
        course_name: string;
        semester: number;
        module_number: number;
        module_title: string;
        topic: string;
    };
}

function buildChunks(courses: CourseEntry[]): Chunk[] {
    const chunks: Chunk[] = [];
    for (const course of courses) {
        for (const module of course.modules) {
            for (const topic of module.topics) {
                chunks.push({
                    content: topic.description,
                    metadata: {
                        course_id: course.course_id,
                        course_code: course.course_code,
                        course_name: course.course_name,
                        semester: course.semester,
                        module_number: module.module_number,
                        module_title: module.title,
                        topic: topic.name,
                    },
                });
            }
        }
    }
    return chunks;
}

async function embedAndInsert(chunks: Chunk[]): Promise<void> {
    console.log(`\nSeeding ${chunks.length} topic chunks...\n`);
    const BATCH_SIZE = 10;
    let inserted = 0;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batch.map((c) => c.content),
        });
        const rows = batch.map((chunk, idx) => ({
            course_id: chunk.metadata.course_id,
            content: chunk.content,
            embedding: embeddingResponse.data[idx].embedding,
            metadata: chunk.metadata,
        }));
        const { error } = await supabase
            .from("syllabus_embeddings")
            .insert(rows);
        if (error) {
            console.error(
                `  [FAILED] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`
            );
        } else {
            inserted += batch.length;
            console.log(
                `  [OK] Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${inserted}/${chunks.length} done`
            );
        }
        if (i + BATCH_SIZE < chunks.length)
            await new Promise((r) => setTimeout(r, 500));
    }
    console.log(`\nDone. ${inserted} chunks inserted.`);
}

async function seedCourseAndModules(): Promise<void> {
    const course = SYLLABUS_DATA[0];
    console.log("\nUpserting course and modules...");
    await supabase.from("courses").upsert(
        {
            id: course.course_id,
            course_code: course.course_code,
            course_name: course.course_name,
            semester: course.semester,
            credits: 4,
            department: "CSE",
            module_count: course.modules.length,
        },
        { onConflict: "id" }
    );
    for (const module of course.modules) {
        await supabase.from("modules").upsert(
            {
                course_id: course.course_id,
                module_number: module.module_number,
                title: module.title,
                topics: module.topics.map((t) => t.name),
                hours: module.hours,
            },
            { onConflict: "course_id,module_number" }
        );
        console.log(`  Module ${module.module_number}: ${module.title}`);
    }
}

async function main() {
    console.log("=== KTU OOPs Syllabus Seeder ===");
    if (!process.env.OPENAI_API_KEY)
        throw new Error("OPENAI_API_KEY not set in .env.local");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
        throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
        throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
    // if (COURSE_ID === "REPLACE_WITH_UUID_FROM_TASK_1")
    //     throw new Error(
    //         "You forgot to replace COURSE_ID. Run scripts/get-course-id.ts first to get the UUID."
    //     );

    await seedCourseAndModules();
    console.log("\nClearing existing embeddings for this course...");
    await supabase
        .from("syllabus_embeddings")
        .delete()
        .eq("course_id", COURSE_ID);
    const chunks = buildChunks(SYLLABUS_DATA);
    await embedAndInsert(chunks);
}

main().catch((err) => {
    console.error("\nFatal error:", err.message);
    process.exit(1);
});
