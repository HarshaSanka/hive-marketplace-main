# **HIVE BRAND GUIDELINES**
## **Version 1.0 | January 2025**

---

## **1. BRAND ESSENCE**

### **1.1 Brand Positioning**

**What we are:**
Hive is a minimal marketplace where small sellers and smart shoppers come together. We're the organized chaos of a thriving community—busy but never overwhelming, full of discovery but never cluttered.

**What we're not:**
We're not another bloated marketplace drowning you in options. We're not corporate and cold. We're not trying to be everything to everyone.

**Brand Personality:**
- **Organized** - Clean, structured, effortless
- **Alive** - Buzzing with activity, dynamic, fresh
- **Collaborative** - Community-driven, sellers + buyers together
- **Honest** - No dark patterns, transparent, straightforward
- **Confident** - Minimal but not sterile, simple but not boring

---

### **1.2 Brand Pillars**

#### **Pillar 1: Collective Strength**
Like a hive, we're stronger together. Small sellers get a platform; smart buyers discover unique products. The community thrives when everyone contributes.

#### **Pillar 2: Organized Simplicity**
A hive is organized chaos—thousands of bees, one purpose. We bring order to marketplace complexity through minimal design and clear paths.

#### **Pillar 3: Natural Discovery**
Bees find flowers naturally. Buyers find products effortlessly. No aggressive algorithms, just smart curation and clean browsing.

---

## **2. VISUAL IDENTITY**

### **2.1 Logo System**

#### **Primary Logo**
```
 __  __  ____  __   __  ______
|  ||  ||    ||  | |  ||   ___|
|  ||  ||  __||  |_|  ||  |___ 
|  ||  || |_  |       ||   ___|
|__||__||____||_     _||______|
              |_| |_|           

hive
```

**Specifications:**
- Wordmark: "hive" in lowercase only
- Font: Custom geometric sans-serif (or Inter Black as base)
- Weight: 700 (Bold) - strong presence, minimal form
- Spacing: Tight kerning (-2% tracking)
- Never use uppercase "HIVE" or "Hive"

#### **Logo Variations**

**Full Logo (Primary)**
- Black wordmark "hive"
- Use on: Website header, app, all primary touchpoints
- Minimum size: 80px width

**Icon Mark (Secondary)**
- Hexagon with "h" inside
- Use on: Favicon, app icon, social media profile
- Minimum size: 32px × 32px

**Monogram (Tertiary)**
- Just the "h" letterform
- Use on: Loading states, small UI elements
- Minimum size: 16px × 16px

---

### **2.2 Logo Construction**

#### **The Hexagon System**

The hexagon is Hive's geometric foundation—inspired by honeycomb structure.

```
     ___________
    /           \
   /             \
  /               \
  |       h       |
  \               /
   \             /
    \___________/
```

**Hexagon Specifications:**
- Internal angles: 120°
- Side ratio: 1:1.155
- Corner radius: 2px (subtle softness)
- Stroke width: 2px (medium weight)

**Usage:**
- Icon backgrounds
- Pattern elements
- Section dividers
- Loading animations
- Decorative elements (sparingly)

---

### **2.3 Color Palette**

#### **Primary Colors**

**Hive Black**
```
HEX: #000000
RGB: 0, 0, 0
CMYK: 0, 0, 0, 100
Pantone: Process Black C
```
**Usage:** Primary text, logo, buttons, borders
**Voice:** Confident, clear, timeless

**Hive White**
```
HEX: #FFFFFF
RGB: 255, 255, 255
CMYK: 0, 0, 0, 0
```
**Usage:** Backgrounds, negative space, inverse text
**Voice:** Clean, spacious, minimal

**Hive Honey** (Accent)
```
HEX: #F59E0B
RGB: 245, 158, 11
CMYK: 0, 36, 96, 4
Pantone: 130 C
```
**Usage:** CTAs, highlights, hover states, success states
**Voice:** Warm, active, organic
**Use sparingly:** 10% of design at most

#### **Secondary Colors**

**Neutral Gray Scale**
```
Gray 50:  #F9FAFB  (Backgrounds, subtle sections)
Gray 100: #F3F4F6  (Card backgrounds)
Gray 200: #E5E7EB  (Borders, dividers)
Gray 400: #9CA3AF  (Placeholder text)
Gray 600: #4B5563  (Secondary text)
Gray 900: #111827  (Alternative to pure black)
```

**Status Colors**
```
Success:  #10B981  (Order confirmed, stock available)
Error:    #EF4444  (Out of stock, form errors)
Warning:  #F59E0B  (Low stock, pending actions)
Info:     #3B82F6  (Neutral information)
```

---

### **2.4 Color Usage Rules**

#### **The 90-9-1 Rule**
- **90%** Black + White (primary content)
- **9%** Gray scale (structure, hierarchy)
- **1%** Hive Honey (accent, emphasis)

#### **Color Combinations**

**✅ Approved Combinations:**
- Black text on white background
- White text on black background
- Honey accent on white background
- Gray 600 text on white background

**❌ Never Use:**
- Honey text on black background (poor contrast)
- Gray on gray (insufficient contrast)
- Multiple accent colors in one view
- Gradients or color blends

---

### **2.5 Typography**

#### **Primary Typeface: Inter**

**Why Inter:**
- Designed for screens
- Excellent readability at all sizes
- Open-source, web-optimized
- Geometric but humanist
- Extensive weight range

**Font Weights:**
```
Inter Regular (400)    - Body text, descriptions
Inter Medium (500)     - Subheadings, labels
Inter Semibold (600)   - Section headers, emphasis
Inter Bold (700)       - Page titles, logo
Inter Black (900)      - Hero text (sparingly)
```

#### **Type Scale**

```css
/* Display */
--text-4xl: 48px / 56px  (Hero headlines)
--text-3xl: 36px / 44px  (Page titles)
--text-2xl: 30px / 38px  (Section headers)
--text-xl:  24px / 32px  (Card titles)

/* Body */
--text-lg:  18px / 28px  (Large body, emphasis)
--text-base: 16px / 24px (Default body text)
--text-sm:  14px / 20px  (Secondary text, captions)
--text-xs:  12px / 16px  (Labels, meta info)
```

#### **Typography Rules**

1. **Hierarchy through weight, not size**
   - Keep sizes consistent within sections
   - Use weight changes for emphasis
   - Example: Product title (16px, bold) vs seller name (16px, regular)

2. **Line length: 60-75 characters**
   - Optimal readability
   - Max-width: 65ch for text blocks

3. **Line height: 1.5 for body, 1.2 for headings**
   - Generous spacing for comfort
   - Tighter for impact headlines

4. **Letter spacing:**
   - Headlines: -1% to -2%
   - Body: 0% (default)
   - Labels/buttons: +2% (all caps only)

---

### **2.6 Spacing System**

#### **The 8px Grid**

All spacing follows 8px increments for consistency.

```
--space-1:  4px   (Tight: icon padding)
--space-2:  8px   (Close: inline elements)
--space-3:  12px  (Related: form field spacing)
--space-4:  16px  (Default: component padding)
--space-6:  24px  (Comfortable: card padding)
--space-8:  32px  (Spacious: section spacing)
--space-12: 48px  (Generous: major sections)
--space-16: 64px  (Dramatic: page sections)
--space-24: 96px  (Hero: landing page)
```

#### **Spacing Application**

**Component Padding:**
- Buttons: 16px horizontal, 12px vertical
- Cards: 24px all sides
- Inputs: 16px horizontal, 12px vertical
- Containers: 24px on mobile, 48px on desktop

**Vertical Rhythm:**
- Stack spacing: 16px between related items
- Section spacing: 48px between sections
- Page margin: 64px top/bottom

---

### **2.7 Iconography**

#### **Icon System: Lucide React**

**Style:**
- Outline style only (never filled icons)
- 24px default size (scale to 16px, 20px, 32px as needed)
- 2px stroke width
- Rounded corners (stroke-linecap: round)
- Black or Gray 600 only

**Common Icons:**
```
Shopping:    ShoppingCart, Package, CreditCard
Navigation:  Search, Menu, X, ChevronRight
Actions:     Plus, Edit, Trash2, Check
Status:      AlertCircle, CheckCircle, Clock
User:        User, Heart, Star
```

**Icon Usage Rules:**
- Always pair with text labels (never icon-only buttons except mobile)
- Maintain 8px spacing between icon and text
- Align icons to text baseline
- Never use decorative icons (every icon must serve a function)

---

### **2.8 Photography & Imagery**

#### **Product Photography Standards**

**Technical Requirements:**
- Minimum: 800×800px
- Recommended: 1200×1200px
- Format: JPG (web-optimized)
- Aspect ratio: 1:1 (square)
- File size: < 500KB

**Style Guidelines:**
- Clean white or neutral background preferred
- Natural lighting, no harsh shadows
- Product centered, fills 80% of frame
- Authentic (no over-editing)
- Consistent perspective across catalog

#### **Lifestyle Photography**

**Mood:**
- Bright, airy, natural light
- Minimalist composition
- GenZ lifestyle (authentic, not staged)
- Diverse representation

**Don'ts:**
- No stock photos (they feel fake)
- No cluttered backgrounds
- No overly polished corporate imagery
- No generic "shopping" clichés

#### **Image Treatments**

**Overlays (when text on image):**
- Black overlay at 40% opacity
- White text, Semibold weight
- Ensure 4.5:1 contrast ratio minimum

**Filters:**
- None. Keep images natural.
- Slight brightness/contrast adjustment only if needed

---

### **2.9 Design Elements**

#### **Borders & Dividers**

```css
/* Border Styles */
border: 1px solid #E5E7EB  (Default)
border: 2px solid #000000  (Emphasis)
border: 1px solid #F59E0B  (Accent/Focus)

/* Border Radius */
--radius-sm:  4px   (Small elements)
--radius-md:  8px   (Buttons, inputs, cards)
--radius-lg:  12px  (Large cards, modals)
--radius-xl:  16px  (Hero sections)
--radius-full: 9999px (Pills, avatars)
```

**Usage:**
- Consistent radius within component families
- Cards: 12px
- Buttons/Inputs: 8px
- Badges: 4px or full (pill)

#### **Shadows**

Minimal shadow usage—only for elevation clarity.

```css
/* Elevation System */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)     (Subtle lift)
--shadow-md:  0 4px 6px rgba(0,0,0,0.07)     (Cards)
--shadow-lg:  0 10px 15px rgba(0,0,0,0.10)   (Dropdowns, modals)
```

**Rules:**
- Maximum 2 shadow levels per view
- Prefer borders over shadows when possible
- Never use colored shadows
- No drop shadows on text

#### **Patterns**

**Hexagonal Grid Pattern** (Decorative)
```
Use: Hero sections, empty states, loading screens
Opacity: 5% (very subtle)
Scale: Large hexagons, irregular spacing
Color: Black or Honey
```

**How to use:**
- Background decoration only
- Never interferes with content
- Fades gracefully on scroll
- Optional, not required

---

## **3. VOICE & TONE**

### **3.1 Brand Voice**

Our voice is:
- **Clear, not clever** - Say what you mean
- **Warm, not corporate** - Human, approachable
- **Confident, not arrogant** - We know what we're good at
- **Helpful, not pushy** - Guide, don't sell

#### **Voice Characteristics**

**We sound like:**
- A smart friend who knows their stuff
- Organized but not uptight
- Enthusiastic but not over-the-top
- Direct but kind

**We don't sound like:**
- Used car salespeople
- Corporate robots
- Overly casual "hey fam" brands
- Condescending explainers

---

### **3.2 Tone Guidelines by Context**

| Context | Tone | Example |
|---------|------|---------|
| **Marketing** | Confident, inspiring | "Shop smart. Support small. Find your Hive." |
| **Product UI** | Clear, helpful | "Add to cart" not "Bag it!" |
| **Errors** | Apologetic, constructive | "Oops, that didn't work. Check your email format." |
| **Success** | Satisfied, brief | "Order placed! We'll keep you updated." |
| **Onboarding** | Encouraging, simple | "Welcome! Let's set up your shop in 2 minutes." |
| **Help/Support** | Patient, thorough | "We're here to help. Here's what you can do..." |

---

### **3.3 Writing Guidelines**

#### **General Rules**

1. **Be concise** - Every word earns its place
2. **Active voice** - "Add to cart" not "Cart can be added to"
3. **Second person** - "Your orders" not "The orders"
4. **Present tense** - "Save 20%" not "You will save"
5. **Contractions welcome** - "We're" not "We are"

#### **Button Copy**

**✅ Good:**
- Add to Cart
- Continue to Payment
- Mark as Shipped
- View All Products
- Update Profile

**❌ Bad:**
- Submit (too vague)
- Click Here (obvious)
- OK (not descriptive)
- Yes/No (unclear context)

#### **Empty States**

**Pattern:** State the situation + What they can do

**✅ Examples:**
- "Your cart is empty. Start shopping to fill it up."
- "No orders yet. When sellers ship, they'll appear here."
- "No products found. Try adjusting your filters."

**❌ Bad:**
- "Nothing here!" (unhelpful)
- "404 - Cart empty" (technical jargon)
- Just an image with no text (unclear)

---

### **3.4 Microcopy Standards**

| Element | Copy | Notes |
|---------|------|-------|
| **Login CTA** | "Sign in" or "Log in" | Never "Login" (one word) |
| **Register CTA** | "Create account" | Not "Sign up" or "Register" |
| **Logout** | "Sign out" | Consistent with "Sign in" |
| **Cart** | "Cart (3)" | Show count in header |
| **Empty cart** | "Your cart is empty" | Not "No items" |
| **Search placeholder** | "Search products..." | Not "Search" alone |
| **Price** | "₹1,299" | Always include currency symbol |
| **Stock low** | "Only 3 left" | Create urgency naturally |
| **Out of stock** | "Out of stock" | Not "Unavailable" |
| **Loading** | "Loading..." | Not spinner alone |
| **Error generic** | "Something went wrong. Please try again." | |
| **Success** | "Done!" or specific "Product added" | Brief celebration |

---

## **4. COMPONENT GUIDELINES**

### **4.1 Buttons**

#### **Primary Button**
```
Background: #000000
Text: #FFFFFF (Inter Semibold 16px)
Padding: 12px 24px
Border-radius: 8px
Height: 44px (minimum touch target)

Hover: #1a1a1a
Active: #333333
Disabled: #9CA3AF, opacity 50%
```

**Usage:** Main actions (Add to Cart, Checkout, Submit)

#### **Secondary Button**
```
Background: transparent
Border: 1px solid #E5E7EB
Text: #000000

Hover: Background #F3F4F6
```

**Usage:** Alternative actions (Cancel, Back)

#### **Text Button**
```
Background: none
Text: #000000 underline
Padding: 0

Hover: #4B5563
```

**Usage:** Tertiary actions (View All, Learn More)

---

### **4.2 Forms**

#### **Input Fields**
```
Height: 44px
Padding: 0 16px
Border: 1px solid #E5E7EB
Border-radius: 8px
Font: Inter Regular 16px

Focus: Border #000000, outline none
Error: Border #EF4444
Success: Border #10B981
```

#### **Labels**
```
Font: Inter Medium 14px
Color: #111827
Margin-bottom: 8px
```

#### **Helper Text**
```
Font: Inter Regular 12px
Color: #6B7280
Margin-top: 4px
```

#### **Error Messages**
```
Font: Inter Regular 12px
Color: #EF4444
Margin-top: 4px
Icon: AlertCircle (16px)
```

---

### **4.3 Cards**

#### **Product Card**
```
Width: 280px (flexible)
Padding: 0 (image full-bleed)
Border: 1px solid #E5E7EB
Border-radius: 12px
Shadow: none (just border)

Hover: Shadow-md, border #000000
```

**Structure:**
```
┌─────────────────────┐
│                     │
│   Product Image     │ 280x280px, object-cover
│     (1:1 ratio)     │
│                     │
├─────────────────────┤
│ Title (2 lines max) │ 16px Semibold, 16px padding
│ ₹1,299              │ 18px Bold
│ ⭐ 4.5 (23)        │ 14px Regular
└─────────────────────┘
```

#### **Standard Card**
```
Padding: 24px
Border: 1px solid #E5E7EB
Border-radius: 12px
Background: #FFFFFF
```

---

### **4.4 Navigation**

#### **Header (Buyer)**
```
Height: 64px
Background: #FFFFFF
Border-bottom: 1px solid #E5E7EB
Position: Sticky top

Layout:
[Logo] [Search Bar - centered, 400px] [Cart Icon] [Profile]
```

#### **Seller Sidebar**
```
Width: 240px
Background: #FFFFFF
Border-right: 1px solid #E5E7EB

Active link: Background #000000, Text #FFFFFF
Hover: Background #F3F4F6
```

---

### **4.5 Modals & Overlays**

#### **Modal**
```
Max-width: 500px
Padding: 32px
Border-radius: 16px
Background: #FFFFFF
Shadow: shadow-lg

Overlay: rgba(0,0,0,0.5)
```

**Structure:**
```
┌──────────────────────────────────┐
│ Title (24px Semibold)      [X]   │
├──────────────────────────────────┤
│                                  │
│ Content                          │
│                                  │
├──────────────────────────────────┤
│           [Cancel] [Confirm]     │
└──────────────────────────────────┘
```

---

## **5. APPLICATION EXAMPLES**

### **5.1 Logo Applications**

#### **Website Header**
```
Desktop: 100px width, left-aligned, 24px left margin
Mobile: 80px width, centered
```

#### **Email Signatures**
```
Logo: Black wordmark
Size: 120px width
Followed by tagline (optional): "Shop smart. Support small."
```

#### **Social Media**
- **Profile:** Hexagon icon with white "h" on black
- **Cover/Banner:** Black background, white wordmark, hexagon pattern at 3% opacity

---

### **5.2 Marketing Materials**

#### **Social Media Posts**

**Instagram Post Template:**
```
Format: 1080x1080px
Background: White
Logo: Top left corner, 80px
Content: Centered
Text: Black, Inter Bold
CTA: Honey accent underline

Border: 20px white margin all sides
```

**Story Template:**
```
Format: 1080x1920px
Background: Black or White (alternate)
Logo: Centered or top
Text: Large, centered
Minimal design: 1-2 elements max
```

#### **Email Templates**

**Transactional Emails:**
```
Header: Black bar, white logo, 64px height
Body: White background, 600px max-width
Text: Gray 900, Inter Regular 16px
CTA Button: Honey background, white text
Footer: Gray background, small text
```

**Style:**
- Single column
- Generous padding (32px)
- Bullet lists for order items
- Clear hierarchy

---

### **5.3 Packaging (Future)**

When Hive branded packaging is needed:

**Box Design:**
- Kraft paper (natural, sustainable)
- Black logo stamp
- Hexagonal pattern (subtle)
- No excessive branding

**Stickers:**
- Round or hexagonal
- Black logo on white
- 2" diameter
- "Made with ❤️ by [Seller Name]"

---

## **6. DO'S AND DON'TS**

### **6.1 Logo Usage**

#### **✅ DO:**
- Use approved logo files only
- Maintain clear space (minimum 50% of logo height)
- Use on white or light backgrounds primarily
- Scale proportionally
- Use black logo on light backgrounds
- Use white logo on dark backgrounds

#### **❌ DON'T:**
- Rearrange, redraw, or modify the logo
- Use Hive Honey for the logo
- Add effects (drop shadow, gradients, outlines)
- Rotate or distort
- Place on busy backgrounds without overlay
- Use all caps "HIVE"

---

### **6.2 Color Usage**

#### **✅ DO:**
- Lead with black and white (90%)
- Use Honey sparingly for emphasis
- Maintain sufficient contrast (4.5:1 minimum)
- Use status colors functionally (green = success)

#### **❌ DON'T:**
- Create custom colors outside the palette
- Use multiple accent colors in one design
- Use Honey as primary brand color
- Use gradients or color blends
- Use low-contrast color combinations

---

### **6.3 Typography**

#### **✅ DO:**
- Use Inter font family exclusively
- Stick to approved weights (400, 500, 600, 700)
- Follow type scale consistently
- Left-align body text
- Use sentence case for headings

#### **❌ DON'T:**
- Mix typefaces (no secondary fonts)
- Use decorative or script fonts
- Use all caps for body text
- Center-align paragraphs
- Use type smaller than 12px
- Manually adjust letter spacing on body text

---

### **6.4 Imagery**

#### **✅ DO:**
- Use high-quality, authentic photography
- Maintain consistent lighting and mood
- Show products clearly on clean backgrounds
- Represent diverse users and sellers

#### **❌ DON'T:**
- Use generic stock photos
- Over-edit or apply heavy filters
- Show cluttered or distracting backgrounds
- Use pixelated or low-resolution images
- Include competitor branding in photos

---

## **7. BRAND EXPRESSIONS**

### **7.1 Tagline Options**

**Primary:**
"Shop smart. Support small."

**Alternatives:**
- "Where good finds find you"
- "Small shops. Big collective."
- "Shopping, simplified together"
- "Your marketplace. Their passion."

### **7.2 Messaging Framework**

| Audience | Key Message | Proof Point |
|----------|-------------|-------------|
| **Buyers** | Discover unique products from small sellers without the overwhelming clutter | Curated feed, minimal interface, quality over quantity |
| **Sellers** | List and sell in minutes. Zero barriers, full control. | Instant activation, bulk upload, 0% setup fees |
| **Investors** | Building the GenZ marketplace for India's long tail of small businesses | Fast-growing solopreneur segment, mobile-first, asset-light |

### **7.3 Value Propositions**

**For Buyers:**
- "Fast shopping, zero overwhelm"
- "Discover small brands, big quality"
- "Clean interface, clear choices"

**For Sellers:**
- "Your shop, live in 3 minutes"
- "Sell more, stress less"
- "Built for solopreneurs"

---

## **8. IMPLEMENTATION CHECKLIST**

### **8.1 Design Handoff**

Before any design goes to development:

- [ ] Colors use approved hex codes
- [ ] Typography uses Inter font, approved sizes/weights
- [ ] Spacing follows 8px grid
- [ ] Icons are from Lucide React library
- [ ] Buttons meet minimum 44px touch target
- [ ] Contrast ratios verified (WCAG AA minimum)
- [ ] Responsive breakpoints defined (mobile, tablet, desktop)
- [ ] Hover/focus states documented
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed

### **8.2 Development Standards**

- [ ] Use Tailwind utility classes (aligned with brand colors)
- [ ] Implement spacing system with CSS variables
- [ ] Load Inter font from Google Fonts or self-hosted
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Implement dark mode with inverted colors (future)
- [ ] Test accessibility (keyboard navigation, screen readers)

---

## **9. BRAND EVOLUTION**

### **9.1 What Can Change**

As Hive grows, these elements may evolve:
- Accent color intensity (more or less Honey)
- Photography style (as brand matures)
- Messaging specificity (as audience segments)
- Marketing campaigns (seasonal, cultural)
- Product features in UI

### **9.2 What Never Changes**

Core identity elements that define Hive:
- Lowercase wordmark "hive"
- Black and white foundation
- Hexagonal geometric system
- Minimal, clean aesthetic
- Community-first positioning
- Inter typography
- Direct, helpful voice

---

## **10. RESOURCES**

### **10.1 Download Assets**

**Logo Pack:**
- hive-logo-black.svg
- hive-logo-white.svg
- hive-icon-black.svg
- hive-icon-white.svg
- hive-logo-black.png (2x, 3x)

**Brand Kit:**
- Color swatches (Figma, Adobe, Sketch)
- Typography files (Inter font family)
- Icon library (Lucide React)
- Component library (Figma)
- Email templates

### **10.2 Tools**

- **Design:** Figma (primary), Adobe XD (secondary)
- **Prototyping:** Figma, Framer
- **Image editing:** Photoshop, Figma
- **Fonts:** Google Fonts, Adobe Fonts
- **Icons:** Lucide React library
- **Color tools:** Coolors.co, Contrast Checker

### **10.3 Contacts**

- **Brand questions:** brand@usehive.com
- **Asset requests:** design@usehive.com
- **Partnership branding:** partnerships@usehive.com

---

## **APPROVAL & VERSION CONTROL**

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0 | Jan 13, 2025 | Initial brand guidelines | Product Owner |

**Next Review:** Q2 2025

---

**END OF BRAND GUIDELINES**

---

## **QUICK REFERENCE CARD**

**Colors:**
- Primary: Black (#000000) + White (#FFFFFF)
- Accent: Hive Honey (#F59E0B) - use sparingly
- Gray: #E5E7EB (borders), #6B7280 (secondary text)

**Typography:**
- Font: Inter (400, 500, 600, 700)
- Body: 16px/24px
- Headings: 24-48px, Bold

**Spacing:**
- Base: 8px grid
- Component padding: 16-24px
- Section spacing: 48-64px

**Logo:**
- Always lowercase "hive"
- Black on light, white on dark
- 50% clear space around logo

**Voice:**
- Clear, not clever
- Warm, not corporate
- Helpful, not pushy

---

**Your Hive brand is ready to take flight! 🐝**