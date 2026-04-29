export type SeoPage = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  exampleMeal: string;
  intro: string;
  useCases: Array<{ title: string; body: string }>;
  steps: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const seoPages: SeoPage[] = [
  {
    slug: "ai-meal-scanner",
    eyebrow: "AI meal scanner",
    title: "AI Meal Scanner for Calories, Protein, Carbs, Fat, and Mixed Plates",
    description:
      "Scan food photos with myNutriAI, review editable calorie and macro estimates for US, Indian, and mixed meals, and save meals to a daily nutrition tracker.",
    primaryKeyword: "AI meal scanner",
    secondaryKeywords: [
      "food photo calorie counter",
      "AI calorie scanner",
      "meal photo nutrition app",
      "AI food tracker",
      "mixed meal calorie scanner",
    ],
    exampleMeal: "chicken burrito bowl with rice, beans, cheese, salsa and guacamole",
    intro:
      "Most calorie trackers still make users search food databases one item at a time. myNutriAI starts with the plate: upload a food photo, get a structured meal estimate, edit portions, and save verified calories and macros to your day.",
    useCases: [
      {
        title: "Mixed plates",
        body: "Use the scanner for burrito bowls, thalis, restaurant plates, wraps, sandwiches, salads, pasta bowls, and home-cooked meals with multiple ingredients.",
      },
      {
        title: "Fast macro checks",
        body: "Estimate calories, protein, carbs, and fat before deciding what to eat next.",
      },
      {
        title: "Editable estimates",
        body: "Adjust detected items and serving sizes before anything counts toward your daily log.",
      },
    ],
    steps: [
      {
        title: "Upload a meal photo",
        body: "Take a photo of your food or upload an existing image from your phone.",
      },
      {
        title: "Review detected food items",
        body: "myNutriAI breaks the meal into editable line items with calories and macros.",
      },
      {
        title: "Save and get guidance",
        body: "The saved meal updates your calorie budget, protein gap, dashboard, recommendations, and coach context.",
      },
    ],
    faqs: [
      {
        question: "Is an AI meal scanner accurate enough for tracking?",
        answer:
          "AI food estimates should be reviewed before saving. myNutriAI is built around editable results so users can correct items, portions, and calories before the meal affects their daily targets.",
      },
      {
        question: "Can I type a meal instead of using a photo?",
        answer:
          "Yes. myNutriAI supports both food photos and typed meal descriptions for users who prefer manual logging.",
      },
      {
        question: "Does the scan update my nutrition goals?",
        answer:
          "Yes. Once saved, the meal updates calories, protein, carbs, fat, recent meals, and next-meal recommendations.",
      },
    ],
  },
  {
    slug: "burrito-bowl-calorie-tracker",
    eyebrow: "Burrito bowl calories",
    title: "Burrito Bowl Calorie Tracker with Editable Macros",
    description:
      "Estimate burrito bowl calories and macros for rice, beans, chicken, steak, cheese, salsa, sour cream, guacamole, and vegetables.",
    primaryKeyword: "burrito bowl calorie tracker",
    secondaryKeywords: ["Chipotle calorie tracker", "burrito bowl macros", "Mexican bowl calories", "takeout calorie tracker"],
    exampleMeal: "chicken burrito bowl with brown rice, black beans, cheese, salsa, lettuce and guacamole",
    intro:
      "Burrito bowls can range widely depending on rice, beans, protein, cheese, sour cream, guacamole, and portion size. myNutriAI lets users describe the bowl, review the line items, and correct the estimate before saving.",
    useCases: [
      { title: "Fast casual orders", body: "Estimate bowls from Chipotle-style, Qdoba-style, and local Mexican restaurants." },
      { title: "Protein goals", body: "Compare chicken, steak, beans, cheese, and guacamole against your protein and calorie targets." },
      { title: "Portion edits", body: "Adjust double protein, extra rice, no cheese, or half guacamole before saving." },
    ],
    steps: [
      { title: "Describe the bowl", body: "Type the base, protein, toppings, sauces, and extras." },
      { title: "Review calories and macros", body: "Check calories, protein, carbs, fat, and individual ingredients." },
      { title: "Save after signup", body: "Turn the estimate into a logged meal and update your daily targets." },
    ],
    faqs: [
      { question: "Why do burrito bowl calories vary so much?", answer: "Rice, cheese, sour cream, guacamole, oil, and double protein can change the total quickly." },
      { question: "Can I estimate a Chipotle-style bowl?", answer: "Yes. Describe the ingredients and edit the result before saving." },
      { question: "Can I track macros too?", answer: "Yes. myNutriAI estimates calories, protein, carbs, and fat." },
    ],
  },
  {
    slug: "salad-calorie-tracker",
    eyebrow: "Salad calories",
    title: "Salad Calorie Tracker for Dressings, Toppings, Protein, and Macros",
    description:
      "Estimate salad calories and macros for greens, chicken, eggs, avocado, cheese, nuts, grains, croutons, and dressing.",
    primaryKeyword: "salad calorie tracker",
    secondaryKeywords: ["salad macro tracker", "chicken salad calories", "dressing calorie tracker", "healthy lunch calorie tracker"],
    exampleMeal: "large chicken salad with avocado, feta, walnuts, croutons and ranch dressing",
    intro:
      "Salads can be light or calorie-dense depending on toppings and dressing. myNutriAI helps estimate the full plate instead of treating every salad as the same meal.",
    useCases: [
      { title: "Restaurant salads", body: "Estimate large salads with dressing, cheese, nuts, grains, and protein." },
      { title: "High-protein lunches", body: "See whether chicken, eggs, tofu, beans, or salmon bring enough protein." },
      { title: "Dressing awareness", body: "Account for ranch, Caesar, vinaigrette, olive oil, and creamy dressings." },
    ],
    steps: [
      { title: "Enter the ingredients", body: "List greens, protein, toppings, dressing, and portion clues." },
      { title: "Adjust heavy toppings", body: "Edit avocado, nuts, cheese, oil, and dressing amounts." },
      { title: "Use the estimate", body: "Save the reviewed salad to your daily calorie and macro tracker." },
    ],
    faqs: [
      { question: "Are salads always low calorie?", answer: "No. Dressing, cheese, nuts, avocado, croutons, and grains can make salads calorie-dense." },
      { question: "Can myNutriAI estimate dressing calories?", answer: "Yes, include the dressing type and approximate amount in the meal description." },
      { question: "Can I use this for meal prep salads?", answer: "Yes. Describe the ingredients and edit servings before saving." },
    ],
  },
  {
    slug: "sandwich-calorie-tracker",
    eyebrow: "Sandwich calories",
    title: "Sandwich Calorie Tracker for Bread, Fillings, Sauces, and Sides",
    description:
      "Estimate sandwich calories and macros for turkey, chicken, tuna, cheese, mayo, sauces, bread, chips, and side salads.",
    primaryKeyword: "sandwich calorie tracker",
    secondaryKeywords: ["sub sandwich calories", "turkey sandwich macros", "lunch calorie tracker", "sandwich macro tracker"],
    exampleMeal: "turkey sandwich on wheat bread with cheddar, mayo, lettuce, tomato and chips",
    intro:
      "Sandwich calories depend on bread size, spreads, cheese, protein, and sides. myNutriAI turns a quick description into an editable nutrition estimate.",
    useCases: [
      { title: "Work lunches", body: "Estimate deli sandwiches, subs, wraps, paninis, and cafe lunches." },
      { title: "Sauce and cheese edits", body: "Correct mayo, aioli, cheese, butter, and dressing-heavy sandwiches." },
      { title: "Meal combos", body: "Include chips, soup, fruit, or side salad in the same estimate." },
    ],
    steps: [
      { title: "Describe bread and fillings", body: "Mention bread type, protein, cheese, sauces, vegetables, and sides." },
      { title: "Review the line items", body: "Edit each ingredient if the estimate is too high or low." },
      { title: "Track lunch impact", body: "See how lunch affects dinner calories and remaining protein." },
    ],
    faqs: [
      { question: "Can I include chips or soup?", answer: "Yes. Add sides to the same meal description for one combined estimate." },
      { question: "Can I track wraps too?", answer: "Yes. Wraps, subs, sandwiches, and paninis work with text descriptions." },
      { question: "Does it estimate protein?", answer: "Yes. myNutriAI estimates protein alongside calories, carbs, and fat." },
    ],
  },
  {
    slug: "us-meal-calorie-tracker",
    eyebrow: "US meal tracking",
    title: "US Meal Calorie Tracker for Burrito Bowls, Salads, Sandwiches, Pasta, and Takeout",
    description:
      "Track common US meals with editable calorie and macro estimates for burrito bowls, salads, sandwiches, burgers, pasta, breakfast plates, snacks, and takeout.",
    primaryKeyword: "US meal calorie tracker",
    secondaryKeywords: [
      "American food calorie tracker",
      "burrito bowl calorie tracker",
      "salad calorie tracker",
      "takeout calorie tracker",
    ],
    exampleMeal: "turkey sandwich with chips and a side salad",
    intro:
      "US meals are often customizable, restaurant-sized, and hard to match exactly in a food database. myNutriAI helps users start with a real plate or description, review the estimate, and save calories and macros only after correcting the meal.",
    useCases: [
      {
        title: "Fast casual meals",
        body: "Estimate burrito bowls, sandwiches, burgers, wraps, salads, pasta bowls, breakfast plates, and takeout orders.",
      },
      {
        title: "Protein and calorie goals",
        body: "See whether your next meal should add lean protein, reduce fats, or leave room for dinner.",
      },
      {
        title: "Restaurant portions",
        body: "Adjust servings and ingredients when the plate is larger or smaller than a standard database entry.",
      },
    ],
    steps: [
      {
        title: "Scan or describe the meal",
        body: "Use a food photo or type a short description like chicken burrito bowl with rice, beans, cheese, salsa, and guacamole.",
      },
      {
        title: "Edit the estimate",
        body: "Review calories, protein, carbs, fat, and individual items before saving the meal.",
      },
      {
        title: "Plan the rest of the day",
        body: "myNutriAI updates remaining calories, protein gap, recent meals, and recommendations.",
      },
    ],
    faqs: [
      {
        question: "Can myNutriAI track restaurant and takeout meals?",
        answer:
          "Yes. myNutriAI can estimate common restaurant-style meals and lets users adjust ingredients and portions before saving.",
      },
      {
        question: "Can I track high-protein meals?",
        answer:
          "Yes. The dashboard shows protein logged, protein remaining, and next-meal guidance based on your target.",
      },
      {
        question: "Does this replace manual food search?",
        answer:
          "It reduces manual search by starting from a food photo or text description, but users can still edit the results before saving.",
      },
    ],
  },
  {
    slug: "indian-meal-calorie-tracker",
    eyebrow: "Indian meal tracking",
    title: "Indian Meal Calorie Tracker for Dal, Rice, Roti, Paneer, and Mixed Plates",
    description:
      "Track Indian meals with editable calorie and macro estimates for dal rice, roti sabzi, paneer bowls, thalis, snacks, and restaurant food.",
    primaryKeyword: "Indian meal calorie tracker",
    secondaryKeywords: [
      "Indian food calorie counter",
      "dal rice calories tracker",
      "roti sabzi calorie app",
      "paneer protein tracker",
    ],
    exampleMeal: "two rotis with dal, paneer sabzi, curd and salad",
    intro:
      "Indian meals are difficult to log because portions vary, dishes are mixed, and home recipes do not always match database entries. myNutriAI is designed for reviewing and correcting real plates instead of forcing users into generic food search results.",
    useCases: [
      {
        title: "Home-cooked meals",
        body: "Estimate dal rice, roti sabzi, poha, upma, khichdi, paneer, curd, chutneys, and common home plates.",
      },
      {
        title: "Restaurant orders",
        body: "Log biryani, wraps, bowls, chaats, and combo plates with a review step before saving.",
      },
      {
        title: "Protein-focused diets",
        body: "See whether the next meal should prioritize paneer, eggs, dal, curd, chicken, tofu, or lighter sides.",
      },
    ],
    steps: [
      {
        title: "Scan or describe the plate",
        body: "Use a food photo or type a short description like two rotis, paneer bhurji, dal, and salad.",
      },
      {
        title: "Correct portions",
        body: "Edit servings and items before saving so the log matches how much you actually ate.",
      },
      {
        title: "Plan the next meal",
        body: "myNutriAI uses remaining calories and protein to suggest a better dinner, snack, or recovery meal.",
      },
    ],
    faqs: [
      {
        question: "Can myNutriAI track Indian mixed plates?",
        answer:
          "Yes. myNutriAI is built for mixed plates and lets users edit each detected item before saving the meal.",
      },
      {
        question: "Can I track homemade recipes?",
        answer:
          "You can describe homemade meals or scan the plate, then adjust items and portions to better match your recipe.",
      },
      {
        question: "Is this only for weight loss?",
        answer:
          "No. Users can track calorie targets, protein targets, maintenance goals, weight trends, and overall consistency.",
      },
    ],
  },
  {
    slug: "dal-rice-calorie-tracker",
    eyebrow: "Dal rice calories",
    title: "Dal Rice Calorie Tracker with Protein, Carbs, Fat, and Portions",
    description:
      "Estimate dal rice calories and macros with editable portions for cooked rice, dal, ghee, tadka, curd, pickle, salad, and sides.",
    primaryKeyword: "dal rice calorie tracker",
    secondaryKeywords: ["dal chawal calories", "Indian food calorie counter", "rice and dal macros", "homemade Indian meal tracker"],
    exampleMeal: "one bowl dal rice with ghee, curd, pickle and salad",
    intro:
      "Dal rice looks simple, but calories change with rice quantity, dal thickness, oil, ghee, tadka, and sides. myNutriAI helps estimate the real plate and edit portions before saving.",
    useCases: [
      { title: "Home meals", body: "Estimate dal chawal, khichdi-style plates, curd, pickle, papad, and salad sides." },
      { title: "Portion differences", body: "Correct one bowl versus two bowls, extra rice, or extra ghee." },
      { title: "Protein planning", body: "See whether dal gives enough protein or whether the next meal should add more." },
    ],
    steps: [
      { title: "Describe the plate", body: "Mention rice amount, dal amount, ghee or oil, and sides." },
      { title: "Edit portions", body: "Adjust rice and dal separately for a more realistic estimate." },
      { title: "Save to targets", body: "Use the reviewed meal to update daily calories and macros." },
    ],
    faqs: [
      { question: "Why are dal rice calories hard to estimate?", answer: "Rice serving size, ghee, tadka oil, and dal thickness can change calories significantly." },
      { question: "Can I include curd or pickle?", answer: "Yes. Add sides in the meal description and edit them before saving." },
      { question: "Does dal rice have enough protein?", answer: "It depends on portion size. myNutriAI estimates protein and shows your remaining daily gap." },
    ],
  },
  {
    slug: "roti-sabzi-calorie-tracker",
    eyebrow: "Roti sabzi calories",
    title: "Roti Sabzi Calorie Tracker for Homemade Indian Meals",
    description:
      "Estimate roti sabzi calories and macros with editable portions for chapati, vegetable sabzi, oil, dal, curd, paneer, and sides.",
    primaryKeyword: "roti sabzi calorie tracker",
    secondaryKeywords: ["chapati calories tracker", "sabzi calories", "Indian dinner calorie tracker", "homemade roti calories"],
    exampleMeal: "two rotis with aloo gobi sabzi, dal and curd",
    intro:
      "Roti sabzi varies by roti size, flour, oil, sabzi type, and sides. myNutriAI helps turn a home-style meal description into editable calories and macros.",
    useCases: [
      { title: "Dinner plates", body: "Estimate rotis with sabzi, dal, curd, paneer, pickle, or salad." },
      { title: "Oil-aware tracking", body: "Account for dry sabzi versus oil-heavy preparations." },
      { title: "Flexible portions", body: "Edit two rotis, three rotis, small chapatis, or large homemade rotis." },
    ],
    steps: [
      { title: "List the meal", body: "Type roti count, sabzi name, sides, and any paneer or dal." },
      { title: "Review items", body: "Check each line item and adjust servings or calories." },
      { title: "Plan the next choice", body: "Use remaining calories and protein gap for snack or dinner planning." },
    ],
    faqs: [
      { question: "Can myNutriAI track homemade roti?", answer: "Yes. Describe the number and size of rotis, then adjust if needed." },
      { question: "Can it estimate sabzi cooked with oil?", answer: "Yes. Mention oil-heavy or dry preparation for a better estimate." },
      { question: "Can I include dal and curd?", answer: "Yes. Add all plate items in one description." },
    ],
  },
  {
    slug: "paneer-calorie-tracker",
    eyebrow: "Paneer calories",
    title: "Paneer Calorie Tracker for Protein, Fat, and Indian Meals",
    description:
      "Estimate paneer calories and macros for paneer bowls, paneer bhurji, paneer curry, roti, rice, salads, and high-protein meals.",
    primaryKeyword: "paneer calorie tracker",
    secondaryKeywords: ["paneer protein tracker", "paneer bhurji calories", "paneer curry calories", "vegetarian protein tracker"],
    exampleMeal: "paneer bhurji with two rotis and cucumber salad",
    intro:
      "Paneer is protein-rich but can also be calorie-dense depending on portion size, oil, cream, and sides. myNutriAI helps estimate paneer meals without pretending every recipe is identical.",
    useCases: [
      { title: "Vegetarian protein", body: "Estimate paneer meals for protein goals and calorie budgets." },
      { title: "Home and restaurant recipes", body: "Track paneer bhurji, paneer curry, paneer tikka, bowls, and wraps." },
      { title: "Fat awareness", body: "See how oil, cream, butter, and paneer quantity affect daily targets." },
    ],
    steps: [
      { title: "Describe the paneer meal", body: "Include paneer amount, preparation style, rice or roti, and sides." },
      { title: "Check macros", body: "Review protein, fat, carbs, and calories before saving." },
      { title: "Use daily guidance", body: "Let myNutriAI show whether the next meal should be lighter or protein-led." },
    ],
    faqs: [
      { question: "Is paneer good for protein tracking?", answer: "Paneer can help protein targets, but calories and fat depend on quantity and preparation." },
      { question: "Can I estimate paneer bhurji?", answer: "Yes. Describe the serving, oil, rotis, and sides." },
      { question: "Can myNutriAI handle vegetarian meals?", answer: "Yes. It can estimate vegetarian meals and track protein, carbs, fat, and calories." },
    ],
  },
  {
    slug: "biryani-calorie-tracker",
    eyebrow: "Biryani calories",
    title: "Biryani Calorie Tracker for Rice, Protein, Oil, Raita, and Portions",
    description:
      "Estimate biryani calories and macros for chicken biryani, paneer biryani, veg biryani, raita, salan, and restaurant portions.",
    primaryKeyword: "biryani calorie tracker",
    secondaryKeywords: ["chicken biryani calories", "paneer biryani calories", "Indian restaurant calorie tracker", "rice dish calorie tracker"],
    exampleMeal: "chicken biryani with raita and salan",
    intro:
      "Biryani calories depend on rice quantity, protein, oil, ghee, fried onions, and sides. myNutriAI lets users estimate a real serving and edit the result before saving.",
    useCases: [
      { title: "Restaurant servings", body: "Estimate large portions, half portions, and shared plates." },
      { title: "Protein choices", body: "Compare chicken, egg, paneer, and vegetarian biryani styles." },
      { title: "Sides included", body: "Add raita, salan, soft drinks, or dessert to the same meal." },
    ],
    steps: [
      { title: "Describe the serving", body: "Mention biryani type, portion size, and sides." },
      { title: "Review calories", body: "Check rice, protein, fat, and total calorie estimates." },
      { title: "Balance the day", body: "Use the estimate to plan a lighter or protein-focused next meal." },
    ],
    faqs: [
      { question: "Why is biryani calorie tracking difficult?", answer: "Rice quantity, oil, ghee, meat or paneer, fried toppings, and serving size vary widely." },
      { question: "Can I include raita?", answer: "Yes. Include raita, salan, or other sides in the description." },
      { question: "Can this help with weight loss?", answer: "It can help users understand portion impact and plan the rest of the day around their targets." },
    ],
  },
  {
    slug: "macro-tracker",
    eyebrow: "Macro tracking",
    title: "Macro Tracker for Calories, Protein Goals, Carbs, Fat, and Meal Planning",
    description:
      "Use myNutriAI to track macros from meals, see daily protein gaps, compare eaten versus target, and choose meals that fit your goals.",
    primaryKeyword: "macro tracker",
    secondaryKeywords: [
      "protein tracker",
      "calorie and macro tracker",
      "daily macro goals",
      "meal planning macro app",
    ],
    exampleMeal: "grilled chicken salad with avocado, quinoa and olive oil dressing",
    intro:
      "Macro tracking works when it is fast enough to repeat every day. myNutriAI turns saved meals into a live view of calories, protein, carbs, fat, goal progress, and what still fits before the day ends.",
    useCases: [
      {
        title: "Protein targets",
        body: "See the remaining protein gap and choose a next meal that helps close it.",
      },
      {
        title: "Weight goals",
        body: "Track daily calorie progress while keeping meals flexible and editable.",
      },
      {
        title: "Consistency",
        body: "Use streaks, challenges, weekly digests, and recent history to keep logging from feeling like a chore.",
      },
    ],
    steps: [
      {
        title: "Set targets",
        body: "Add calorie and macro targets based on your body profile, goal, and routine.",
      },
      {
        title: "Log meals quickly",
        body: "Scan food photos or type meals, then review the nutrition estimate.",
      },
      {
        title: "Use the dashboard",
        body: "Check remaining calories, protein gap, goal progress, recommendations, and recent logs from one screen.",
      },
    ],
    faqs: [
      {
        question: "What macros does myNutriAI track?",
        answer:
          "myNutriAI tracks calories, protein, carbs, and fat for saved meals and daily totals.",
      },
      {
        question: "Can I edit macro estimates?",
        answer:
          "Yes. Meal items and calorie values are editable before saving.",
      },
      {
        question: "Does myNutriAI recommend meals based on macros?",
        answer:
          "Yes. Recommendations use the user's saved meals, goals, preferences, allergies, and remaining targets.",
      },
    ],
  },
  {
    slug: "food-photo-calorie-counter",
    eyebrow: "Food photo calories",
    title: "Food Photo Calorie Counter with Editable Meal Estimates",
    description:
      "Use myNutriAI as a food photo calorie counter for mixed plates, restaurant meals, homemade food, protein goals, and daily macro tracking.",
    primaryKeyword: "food photo calorie counter",
    secondaryKeywords: [
      "photo calorie counter",
      "AI calorie counter",
      "food image calorie app",
      "meal photo macro tracker",
    ],
    exampleMeal: "restaurant plate with grilled chicken, rice, vegetables and sauce",
    intro:
      "A food photo calorie counter is useful only when the result is reviewable. myNutriAI scans the meal, separates likely ingredients, estimates calories and macros, and lets users edit before saving.",
    useCases: [
      { title: "Restaurant meals", body: "Estimate plates that do not match a single database item." },
      { title: "Home cooking", body: "Review mixed homemade meals with flexible portions and sides." },
      { title: "Macro awareness", body: "See protein, carbs, and fat alongside calories from the same scan." },
    ],
    steps: [
      { title: "Take a clear photo", body: "Capture the full plate with visible sides, sauces, and drinks." },
      { title: "Review the estimate", body: "Check item names, portions, calories, protein, carbs, and fat." },
      { title: "Save only after edits", body: "Correct the estimate before it updates your daily dashboard." },
    ],
    faqs: [
      { question: "Can a photo calorie counter be exact?", answer: "No photo estimate is exact. myNutriAI is designed for review and correction before logging." },
      { question: "Can it estimate multiple foods in one image?", answer: "Yes. Mixed plates are split into editable line items when possible." },
      { question: "Does it work without a photo?", answer: "Yes. You can also type a meal description." },
    ],
  },
  {
    slug: "protein-tracker",
    eyebrow: "Protein goals",
    title: "Protein Tracker for Daily Targets, Meals, and Macro Planning",
    description:
      "Track protein from meals, see remaining daily protein, and use myNutriAI to plan higher-protein breakfasts, lunches, dinners, and snacks.",
    primaryKeyword: "protein tracker",
    secondaryKeywords: [
      "daily protein tracker",
      "protein goal app",
      "high protein meal tracker",
      "macro protein tracker",
    ],
    exampleMeal: "paneer bhurji with two rotis and curd",
    intro:
      "Protein goals are hard to hit when meals are logged late or estimated roughly. myNutriAI shows protein per meal, protein remaining, and next-meal guidance based on what you already ate.",
    useCases: [
      { title: "Muscle gain", body: "Track whether meals are supporting a higher daily protein target." },
      { title: "Weight loss", body: "Keep protein visible while managing calories." },
      { title: "Vegetarian meals", body: "Estimate paneer, tofu, dal, curd, beans, eggs, and other protein sources." },
    ],
    steps: [
      { title: "Set a protein target", body: "Add daily protein goals in your nutrition profile." },
      { title: "Log meals", body: "Scan or type meals and review protein estimates before saving." },
      { title: "Plan the gap", body: "Use the dashboard to see how much protein remains for the day." },
    ],
    faqs: [
      { question: "Does myNutriAI track protein separately from calories?", answer: "Yes. Protein, carbs, and fat are tracked alongside calories." },
      { question: "Can vegetarian meals be protein tracked?", answer: "Yes. Include paneer, tofu, dal, beans, curd, eggs, or other protein sources in the meal." },
      { question: "Can I edit protein estimates?", answer: "Yes. You can edit meal items before saving." },
    ],
  },
  {
    slug: "weight-loss-calorie-tracker",
    eyebrow: "Weight loss tracking",
    title: "Weight Loss Calorie Tracker with AI Meal Logging and Protein Goals",
    description:
      "Use myNutriAI to track calories for weight loss, review meals before saving, monitor protein, follow trends, and plan the rest of the day.",
    primaryKeyword: "weight loss calorie tracker",
    secondaryKeywords: [
      "calorie deficit tracker",
      "weight loss nutrition app",
      "AI weight loss meal tracker",
      "protein calorie tracker",
    ],
    exampleMeal: "egg white omelette with toast, fruit and coffee",
    intro:
      "Weight loss tracking works best when logging is consistent and meals stay editable. myNutriAI helps users estimate real meals quickly, keep protein visible, and watch daily calorie progress without forcing rigid meal plans.",
    useCases: [
      { title: "Calorie deficit", body: "Track eaten versus target and plan lighter meals when needed." },
      { title: "Protein consistency", body: "Avoid cutting calories so far that protein disappears." },
      { title: "Trend awareness", body: "Use weight entries and dashboard progress to see patterns over time." },
    ],
    steps: [
      { title: "Set your target", body: "Use profile inputs to save daily calorie and macro targets." },
      { title: "Log each meal", body: "Scan photos or type meals, then correct estimates before saving." },
      { title: "Adjust the next meal", body: "Use remaining calories and protein gap to choose the next meal." },
    ],
    faqs: [
      { question: "Is myNutriAI a diet plan?", answer: "No. It is a tracking and guidance tool that helps users log real meals and understand daily targets." },
      { question: "Can I track weight too?", answer: "Yes. myNutriAI includes weight entries and trends." },
      { question: "Can I use it for maintenance?", answer: "Yes. Targets can support weight loss, maintenance, or gain." },
    ],
  },
  {
    slug: "restaurant-calorie-tracker",
    eyebrow: "Restaurant calories",
    title: "Restaurant Calorie Tracker for Takeout, Fast Casual, and Mixed Plates",
    description:
      "Estimate restaurant meal calories and macros with myNutriAI for bowls, salads, sandwiches, biryani, pasta, burgers, sides, and drinks.",
    primaryKeyword: "restaurant calorie tracker",
    secondaryKeywords: [
      "takeout calorie tracker",
      "fast casual calorie tracker",
      "restaurant macro tracker",
      "eating out calorie app",
    ],
    exampleMeal: "pasta with chicken, cream sauce, garlic bread and iced tea",
    intro:
      "Restaurant meals are difficult to log because portions are larger, sauces are hidden, and sides are easy to miss. myNutriAI lets users describe the whole order and correct the estimate before saving.",
    useCases: [
      { title: "Fast casual meals", body: "Estimate burrito bowls, sandwiches, salads, wraps, and pasta bowls." },
      { title: "Indian restaurants", body: "Track biryani, paneer dishes, roti, dal, rice, raita, and snacks." },
      { title: "Full orders", body: "Include drinks, sauces, fries, dessert, and sides in one meal log." },
    ],
    steps: [
      { title: "Describe the order", body: "List main dish, sides, sauces, drinks, and portion clues." },
      { title: "Edit high-impact items", body: "Adjust oil, cheese, sauce, rice, bread, and dessert portions." },
      { title: "Use daily guidance", body: "See what still fits for the rest of the day." },
    ],
    faqs: [
      { question: "Can I estimate takeout calories?", answer: "Yes. Describe the order and edit the result before saving." },
      { question: "Should I include sauces and drinks?", answer: "Yes. These can change calories significantly." },
      { question: "Can it track restaurant macros?", answer: "Yes. myNutriAI estimates protein, carbs, and fat as well as calories." },
    ],
  },
  {
    slug: "telegram-calorie-tracker",
    eyebrow: "Telegram logging",
    title: "Telegram Calorie Tracker for Fast Meal Logging",
    description:
      "Use myNutriAI from Telegram to send food text or photos, estimate calories and macros, and log meals without opening the website.",
    primaryKeyword: "Telegram calorie tracker",
    secondaryKeywords: [
      "Telegram meal logger",
      "Telegram nutrition bot",
      "AI calorie tracker bot",
      "food photo Telegram bot",
    ],
    exampleMeal: "2 rotis, dal, paneer sabzi and salad",
    intro:
      "Some users log more consistently when tracking happens inside the app they already use. myNutriAI supports Telegram meal logging for quick food descriptions, photo estimates, and one-tap meal confirmation.",
    useCases: [
      { title: "Quick text logging", body: "Send meals like chicken rice bowl or dal rice directly to the bot." },
      { title: "Photo estimates", body: "Send a food photo and review calories and macros in Telegram." },
      { title: "Website sync", body: "Meals logged through Telegram connect back to the NutriAI account and dashboard." },
    ],
    steps: [
      { title: "Start the bot", body: "Open the myNutriAI Telegram bot and send /start." },
      { title: "Send food", body: "Send a meal photo or short text description." },
      { title: "Choose meal type", body: "Confirm breakfast, lunch, dinner, or snack from Telegram buttons." },
    ],
    faqs: [
      { question: "Can Telegram users start without the website?", answer: "Yes. Telegram-first users can start from the bot and log meals there." },
      { question: "Can website users connect Telegram?", answer: "Yes. Website users can connect Telegram from Settings." },
      { question: "Does Telegram support photos?", answer: "Yes, when backend image upload and AI analysis are configured." },
    ],
  },
];

export function getSeoPage(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}
