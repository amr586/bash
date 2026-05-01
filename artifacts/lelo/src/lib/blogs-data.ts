import project1 from "@/assets/project-1.png";
import project2 from "@/assets/project-2.png";
import project3 from "@/assets/project-3.png";
import project4 from "@/assets/project-4.png";
import project5 from "@/assets/project-5.png";
import project6 from "@/assets/project-6.png";
import project7 from "@/assets/project-7.png";
import project8 from "@/assets/project-8.png";
import project9 from "@/assets/project-9.png";
import project10 from "@/assets/project-10.png";

export interface BlogPost {
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImage: string;
  dateAr: string;
  dateEn: string;
  bodyAr: { heading?: string; text: string; image?: string }[];
  bodyEn: { heading?: string; text: string; image?: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "bashak-5th-settlement-projects",
    titleAr: "باشاك تبني مستقبلها في قلب التجمع الخامس",
    titleEn: "Bashak Builds Its Future at the Heart of New Cairo's 5th Settlement",
    excerptAr:
      "تعرّف على كيف تؤسس باشاك للتطوير العقاري مشاريعها الضخمة في أرقى مناطق التجمع الخامس بخبرة تجاوزت 10 سنوات.",
    excerptEn:
      "Discover how Bashak Developments establishes major projects in the finest districts of the 5th Settlement with over 10 years of expertise.",
    coverImage: project1,
    dateAr: "مايو ٢٠٢٥",
    dateEn: "May 2025",
    bodyAr: [
      {
        text: "منذ أكثر من ١٠ سنوات، اختارت شركة باشاك للتطوير العقاري منطقة التجمع الخامس موطناً لمشاريعها الكبرى. هذه المنطقة التي تُعدّ من أرقى مناطق القاهرة الجديدة، أتاحت لباشاك بناء وحدات سكنية متميزة تجمع بين الجودة العالية والموقع الاستراتيجي.",
      },
      {
        heading: "لماذا التجمع الخامس؟",
        text: "التجمع الخامس هو واحد من أسرع المناطق نمواً في مصر، مع بنية تحتية متطورة، ومدارس دولية، ومراكز تجارية راقية، وطرق مُحكمة تربطه بقلب القاهرة. باشاك أدركت مبكراً أن الاستثمار في هذه المنطقة هو رهان رابح للمطور والعميل على حدٍّ سواء.",
        image: project2,
      },
      {
        heading: "حضور في أبرز الأحياء",
        text: "نفّذت باشاك مشاريعها في الحي الأول والثاني والخامس، والنرجس، واللوتس، وبيت الوطن، وشارع ٩٠ الشمالي. تنوّع المواقع يعني أن باشاك تُقدّم خياراً لكل عميل بحسب احتياجاته وميزانيته.",
        image: project3,
      },
      {
        heading: "ثقة تبنيها مشروعاً تلو الآخر",
        text: "بتسليم ١٢ مشروعاً ناجحاً وخدمة أكثر من ٨٥٠ عميلاً بنسبة رضا تقترب من ١٠٠٪، تمكّنت باشاك من بناء سمعة راسخة تجعل اسمها ضماناً في حد ذاته.",
      },
    ],
    bodyEn: [
      {
        text: "For over 10 years, Bashak Developments has chosen the 5th Settlement as the home for its major projects. This area, considered one of the finest in New Cairo, has allowed Bashak to build distinguished residential units that combine high quality with strategic location.",
      },
      {
        heading: "Why the 5th Settlement?",
        text: "The 5th Settlement is one of Egypt's fastest-growing areas, with advanced infrastructure, international schools, upscale shopping centers, and well-connected roads linking it to Cairo's heart. Bashak recognized early that investing in this area is a winning bet for both developer and client.",
        image: project2,
      },
      {
        heading: "Presence in the Most Prominent Districts",
        text: "Bashak has executed projects in Districts 1, 2, and 5, Al Narges, Al Lotus, Beit Al Watan, and North 90th Street. The diversity of locations means Bashak offers a choice for every client based on their needs and budget.",
        image: project3,
      },
      {
        heading: "Trust Built Project After Project",
        text: "By delivering 12 successful projects and serving over 850 clients with a near-100% satisfaction rate, Bashak has built a solid reputation that makes its name a guarantee in itself.",
      },
    ],
  },
  {
    slug: "bashak-residential-unit-features",
    titleAr: "مميزات وحدات باشاك السكنية — تصميم يلبّي كل تفصيلة",
    titleEn: "Bashak Residential Units — Design That Meets Every Detail",
    excerptAr:
      "من التشطيب الفاخر إلى الموقع المميز، اكتشف ما يجعل وحدات باشاك خياراً مثالياً لكل من يبحث عن جودة الحياة.",
    excerptEn:
      "From premium finishes to prime location, discover what makes Bashak units the ideal choice for those seeking quality of life.",
    coverImage: project4,
    dateAr: "أبريل ٢٠٢٥",
    dateEn: "April 2025",
    bodyAr: [
      {
        text: "وحدات باشاك السكنية ليست مجرد أربعة جدران؛ هي مساحة مُصمَّمة بعناية لتلائم أسلوب الحياة العصري وتلبّي احتياجات الأسرة المصرية الحديثة في كل تفصيلة صغيرة وكبيرة.",
      },
      {
        heading: "التشطيب على أعلى مستوى",
        text: "تعتمد باشاك في مشاريعها على خامات من الدرجة الأولى، بدايةً من أرضيات السيراميك والبورسلان الفاخر، مروراً بأبواب خشب طبيعي، وانتهاءً بنظم سباكة وكهرباء تلتزم بأعلى معايير الجودة والأمان.",
        image: project5,
      },
      {
        heading: "مساحات مُعاشة لا مجرد متراج",
        text: "تحرص باشاك على تقديم مخططات تتيح الاستغلال الأمثل للمساحة، مع نوافذ واسعة تُدخل الضوء الطبيعي وتصلك بالمناطق الخضراء المحيطة. المساحات تبدأ من ٨٠م² وتصل إلى ٢٥٠م² لتناسب كل احتياج.",
        image: project6,
      },
      {
        heading: "الأمان والخصوصية أولاً",
        text: "جميع مشاريع باشاك تتضمن أنظمة حراسة على مدار الساعة، وكاميرات مراقبة، وبوابات إلكترونية، مما يُوفّر لسكانها شعوراً حقيقياً بالأمان.",
      },
    ],
    bodyEn: [
      {
        text: "Bashak residential units are not just four walls — they are spaces carefully designed to fit the modern lifestyle and meet the needs of the modern Egyptian family in every small and large detail.",
      },
      {
        heading: "Top-Level Finishing",
        text: "Bashak relies on first-class materials in its projects, from luxury ceramic and porcelain flooring, to natural wood doors, to plumbing and electrical systems that comply with the highest quality and safety standards.",
        image: project5,
      },
      {
        heading: "Livable Spaces, Not Just Square Meters",
        text: "Bashak is committed to providing layouts that allow optimal use of space, with wide windows that bring in natural light and connect you to the surrounding green areas. Spaces start from 80m² and reach 250m² to suit every need.",
        image: project6,
      },
      {
        heading: "Safety and Privacy First",
        text: "All Bashak projects include 24/7 security systems, surveillance cameras, and electronic gates, providing residents with a genuine sense of safety.",
      },
    ],
  },
  {
    slug: "12-projects-10-years",
    titleAr: "١٢ مشروعاً في ١٠ سنوات — مسيرة باشاك عبر الزمن",
    titleEn: "12 Projects in 10 Years — Bashak's Journey Through Time",
    excerptAr:
      "رحلة باشاك للتطوير العقاري من المشروع الأول حتى آخر تسليم، قصة نجاح مبنية على الثقة والجودة والالتزام.",
    excerptEn:
      "Bashak Developments' journey from the first project to the latest delivery — a success story built on trust, quality, and commitment.",
    coverImage: project7,
    dateAr: "مارس ٢٠٢٥",
    dateEn: "March 2025",
    bodyAr: [
      {
        text: "بدأت باشاك رحلتها في عالم التطوير العقاري برؤية واضحة: بناء وحدات تُعبّر عن جودة حقيقية لا مجرد ادعاء. ومع مرور السنوات، تحوّلت هذه الرؤية إلى ١٢ مشروعاً مُسلَّماً، كل واحد منها يمثّل إضافة حقيقية لمنطقته.",
      },
      {
        heading: "المشاريع الرائدة",
        text: "من أبرز مشاريع باشاك مجمعات سكنية في الحي الأول واللوتس والنرجس، إضافة إلى وحدات تجارية وإدارية على شارع ٩٠ الشمالي الذي يُعدّ العصب التجاري لمنطقة التجمع الخامس.",
        image: project8,
      },
      {
        heading: "أرقام تتحدث عن نفسها",
        text: "٨٥٠+ عميل مستفيد، ١٢ مشروع مُسلَّم بالكامل، ونسبة رضا تصل إلى ٩٩٪ — هذه الأرقام ليست مجرد إحصاءات، بل هي تعبير عن ثقة حقيقية بنتها باشاك مع عملائها عاماً بعد عام.",
        image: project9,
      },
      {
        heading: "المستقبل أوسع",
        text: "باشاك لا تتوقف عند ما حققته. مع خطط توسّع طموحة في مناطق جديدة وأنماط عقارية متنوعة، يبقى الأفضل دائماً قادماً.",
      },
    ],
    bodyEn: [
      {
        text: "Bashak began its journey in real estate development with a clear vision: to build units that express genuine quality, not just claims. Over the years, this vision transformed into 12 delivered projects, each representing a true addition to its area.",
      },
      {
        heading: "Pioneer Projects",
        text: "Among Bashak's most notable projects are residential complexes in District 1, Al Lotus, and Al Narges, in addition to commercial and administrative units on North 90th Street — considered the commercial hub of the 5th Settlement.",
        image: project8,
      },
      {
        heading: "Numbers Speak for Themselves",
        text: "850+ beneficiary clients, 12 fully delivered projects, and a 99% satisfaction rate — these numbers are not just statistics, but an expression of genuine trust that Bashak has built with its clients year after year.",
        image: project9,
      },
      {
        heading: "The Future Is Wider",
        text: "Bashak doesn't stop at what it has achieved. With ambitious expansion plans in new areas and diverse real estate types, the best is always yet to come.",
      },
    ],
  },
  {
    slug: "why-choose-bashak",
    titleAr: "لماذا تختار باشاك؟ — ٥ أسباب تجعلها الخيار الأول",
    titleEn: "Why Choose Bashak? — 5 Reasons It's the First Choice",
    excerptAr:
      "في سوق مليء بالخيارات، ما الذي يجعل باشاك للتطوير العقاري تتميز؟ إليك الأسباب الحقيقية التي تجعلها الخيار الأمثل.",
    excerptEn:
      "In a market full of options, what makes Bashak Developments stand out? Here are the real reasons that make it the optimal choice.",
    coverImage: project10,
    dateAr: "فبراير ٢٠٢٥",
    dateEn: "February 2025",
    bodyAr: [
      {
        text: "الاختيار الصح في العقارات يبدأ بالشركة الصح. باشاك للتطوير العقاري تُقدّم لك خمسة أسباب وجيهة تجعلها الشريك الأمثل في رحلة شراء منزلك أو استثمارك العقاري.",
      },
      {
        heading: "١. المطوّر والمالك في نفس الوقت",
        text: "باشاك لا تتوسّط بين المطوّر والمالك — هي المطوّر والمالك معاً. هذا يعني أن كل قرار تصميمي وتنفيذي يأتي من جهة واحدة تتحمّل المسؤولية الكاملة، مما يضمن جودة متسقة في كل مشروع.",
        image: project1,
      },
      {
        heading: "٢. خبرة أكثر من ١٠ سنوات",
        text: "العقارات عالم يحتاج خبرة حقيقية لا شعارات. مع أكثر من عقد من العمل في السوق المصري، تمتلك باشاك معرفة عميقة بتفاصيل السوق، وتقلباته، وما يحتاجه العميل فعلاً.",
      },
      {
        heading: "٣. تمويل ميسّر وتقسيط مرن",
        text: "باشاك تؤمن بأن الجودة يجب أن تكون في متناول الجميع. لذلك تُتيح شراكات مع كبرى البنوك المصرية لتوفير تمويل عقاري مريح، مع خيارات تقسيط تصل إلى ٨ سنوات.",
        image: project2,
      },
      {
        heading: "٤. شفافية كاملة في التعامل",
        text: "من أول يوم تتعامل فيه مع باشاك، ستجد وضوحاً تاماً في العقود والأسعار وجداول التسليم. لا مفاجآت، لا رسوم مخفية.",
      },
      {
        heading: "٥. خدمة ما بعد البيع",
        text: "التزامنا لا ينتهي بتسليم المفتاح. فريق باشاك دائماً جاهز للرد على استفساراتك ومتابعة أي صيانة في فترة الضمان.",
      },
    ],
    bodyEn: [
      {
        text: "The right choice in real estate starts with the right company. Bashak Developments gives you five solid reasons that make it the ideal partner in your journey to buying a home or making a real estate investment.",
      },
      {
        heading: "1. Developer and Owner at the Same Time",
        text: "Bashak doesn't mediate between developer and owner — it is both developer and owner simultaneously. This means every design and execution decision comes from one party that bears full responsibility, ensuring consistent quality across every project.",
        image: project1,
      },
      {
        heading: "2. Over 10 Years of Experience",
        text: "Real estate needs genuine experience, not just slogans. With over a decade of work in the Egyptian market, Bashak has deep knowledge of market details, its fluctuations, and what clients actually need.",
      },
      {
        heading: "3. Accessible Financing and Flexible Installments",
        text: "Bashak believes quality must be within everyone's reach. That's why it offers partnerships with major Egyptian banks for comfortable real estate financing, with installment options of up to 8 years.",
        image: project2,
      },
      {
        heading: "4. Full Transparency in Dealings",
        text: "From the first day you deal with Bashak, you'll find complete clarity in contracts, prices, and delivery schedules. No surprises, no hidden fees.",
      },
      {
        heading: "5. After-Sales Service",
        text: "Our commitment doesn't end with handing over the key. The Bashak team is always ready to answer your inquiries and follow up on any maintenance during the warranty period.",
      },
    ],
  },
  {
    slug: "real-estate-financing-bashak",
    titleAr: "التمويل العقاري مع باشاك — اشتري بيتك بأيسر الشروط",
    titleEn: "Real Estate Financing with Bashak — Own Your Home on the Best Terms",
    excerptAr:
      "تعرّف على خيارات التمويل والتقسيط المتاحة مع باشاك، وكيف يمكنك امتلاك وحدتك بدون ضغوط مالية.",
    excerptEn:
      "Learn about the financing and installment options available with Bashak, and how you can own your unit without financial pressure.",
    coverImage: project3,
    dateAr: "يناير ٢٠٢٥",
    dateEn: "January 2025",
    bodyAr: [
      {
        text: "من أكبر العوائق أمام شراء العقار في مصر هو التمويل. باشاك للتطوير العقاري تعمل بجد على إزالة هذا الحاجز من خلال شراكات استراتيجية مع كبرى البنوك وشركات التمويل العقاري.",
      },
      {
        heading: "شراكات بنكية قوية",
        text: "تعاقدت باشاك مع عدد من أبرز البنوك المصرية لتوفير تمويل عقاري بفوائد تنافسية، مما يُتيح للعملاء الحصول على القيمة الكاملة للوحدة بمقدّم مناسب وأقساط شهرية مريحة.",
        image: project4,
      },
      {
        heading: "تقسيط حتى ٨ سنوات",
        text: "تُتيح باشاك خطط تقسيط مرنة تصل إلى ٨ سنوات، مع مقدّم يبدأ من ١٠٪ فقط من إجمالي قيمة الوحدة. هذا يجعل امتلاك وحدة عالية الجودة في التجمع الخامس في متناول شريحة أوسع من العملاء.",
        image: project5,
      },
      {
        heading: "خطوات التمويل — بسيطة وسريعة",
        text: "١. تواصل مع فريق المبيعات لتحديد الوحدة المناسبة.\n٢. يتم تقديم ملف التمويل للبنك الشريك.\n٣. الموافقة المبدئية خلال ٧ أيام عمل.\n٤. التعاقد وبدء التسليم وفق الجدول المتفق عليه.",
      },
    ],
    bodyEn: [
      {
        text: "One of the biggest obstacles to buying real estate in Egypt is financing. Bashak Developments works hard to remove this barrier through strategic partnerships with major banks and real estate financing companies.",
      },
      {
        heading: "Strong Banking Partnerships",
        text: "Bashak has partnered with several of Egypt's most prominent banks to provide real estate financing at competitive rates, allowing clients to obtain the full unit value with an appropriate down payment and comfortable monthly installments.",
        image: project4,
      },
      {
        heading: "Installments Up to 8 Years",
        text: "Bashak offers flexible installment plans of up to 8 years, with a down payment starting from just 10% of the total unit value. This makes owning a high-quality unit in the 5th Settlement accessible to a wider range of clients.",
        image: project5,
      },
      {
        heading: "Financing Steps — Simple and Fast",
        text: "1. Contact the sales team to identify the right unit.\n2. The financing file is submitted to the partner bank.\n3. Preliminary approval within 7 working days.\n4. Contract signing and delivery begins according to the agreed schedule.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
