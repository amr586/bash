import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { ShieldCheck, FileText } from "lucide-react";

type Tab = "terms" | "privacy";

interface TermsDialogProps {
  trigger: ReactNode;
  defaultTab?: Tab;
}

export function TermsDialog({ trigger, defaultTab = "terms" }: TermsDialogProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col"
        dir="rtl"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl">
            الشروط والأحكام وسياسة الخصوصية
          </DialogTitle>
          <DialogDescription>
            يرجى قراءة الشروط وسياسة الخصوصية قبل استخدام موقع باشاك.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-foreground/5 border border-border/40">
          <button
            type="button"
            onClick={() => setTab("terms")}
            className={`py-2 rounded-lg text-sm font-semibold transition inline-flex items-center justify-center gap-2 ${
              tab === "terms"
                ? "bg-[var(--gold)] text-black"
                : "text-foreground/70 hover:text-foreground"
            }`}
            data-testid="tab-terms"
          >
            <FileText className="h-4 w-4" />
            الشروط والأحكام
          </button>
          <button
            type="button"
            onClick={() => setTab("privacy")}
            className={`py-2 rounded-lg text-sm font-semibold transition inline-flex items-center justify-center gap-2 ${
              tab === "privacy"
                ? "bg-[var(--gold)] text-black"
                : "text-foreground/70 hover:text-foreground"
            }`}
            data-testid="tab-privacy"
          >
            <ShieldCheck className="h-4 w-4" />
            سياسة الخصوصية
          </button>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4 max-h-[55vh]">
          {tab === "terms" ? <TermsContent /> : <PrivacyContent />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-foreground/85 pb-2">
      <Section title="1. مقدمة">
        <p>
          مرحبًا بك في موقع <strong>باشاك للتطوير العقاري</strong>. باستخدامك للموقع
          أو إنشاء حساب فيه، فأنت توافق على الالتزام بالشروط والأحكام التالية.
          إذا كنت لا توافق على أي بند منها، يُرجى عدم استخدام الموقع.
        </p>
      </Section>

      <Section title="2. الحساب والمسؤولية">
        <ul className="list-disc pr-5 space-y-1">
          <li>تتحمّل مسؤولية الحفاظ على سرية بيانات الدخول الخاصة بك (الإيميل وكلمة السر).</li>
          <li>تتعهّد بتقديم بيانات صحيحة ودقيقة عند التسجيل وعند إضافة أي عقار.</li>
          <li>أي نشاط يتم من خلال حسابك يعتبر مسؤوليتك الشخصية.</li>
          <li>يحق لإدارة الموقع تعليق أو حذف أي حساب يخالف الشروط.</li>
        </ul>
      </Section>

      <Section title="3. إضافة العقارات">
        <ul className="list-disc pr-5 space-y-1">
          <li>الإعلانات التي يضيفها المستخدمون تخضع لمراجعة الإدارة قبل النشر.</li>
          <li>يجب أن تكون الصور والمعلومات حقيقية وتخصّ العقار المعروض فعليًا.</li>
          <li>يُمنع نشر إعلانات مكرّرة أو مضلّلة أو لعقارات غير متوفّرة.</li>
          <li>إدارة الموقع تحتفظ بحق رفض أو حذف أي إعلان دون إبداء أسباب.</li>
        </ul>
      </Section>

      <Section title="4. التواصل والمعاملات">
        <p>
          باشاك يوفّر منصّة للتعريف بالعقارات والتواصل بين الملّاك والمهتمّين فقط.
          أي اتفاق أو معاملة مالية تتم بين الأطراف خارج الموقع تقع على مسؤوليتهم
          الشخصية، ولا يتحمّل الموقع أي مسؤولية قانونية أو مالية تجاهها.
        </p>
      </Section>

      <Section title="5. الملكية الفكرية">
        <p>
          جميع الحقوق محفوظة لشركة باشاك للتطوير العقاري. الشعار، التصميم، والمحتوى
          الأصلي للموقع لا يجوز نسخه أو إعادة استخدامه دون إذن مكتوب.
        </p>
      </Section>

      <Section title="6. التعديلات">
        <p>
          يحق لإدارة الموقع تعديل هذه الشروط في أي وقت، ويتم إخطار المستخدمين
          بالتغييرات الجوهرية. استمرارك في استخدام الموقع بعد التعديل يعني موافقتك
          على الشروط الجديدة.
        </p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-foreground/85 pb-2">
      <Section title="1. البيانات التي نجمعها">
        <ul className="list-disc pr-5 space-y-1">
          <li>الاسم، الإيميل، ورقم الموبايل عند إنشاء الحساب.</li>
          <li>بيانات العقارات التي تضيفها (العنوان، السعر، الصور، إلخ).</li>
          <li>بيانات تقنية أساسية مثل عنوان الـ IP ونوع المتصفّح لأغراض الأمان والتحليل.</li>
        </ul>
      </Section>

      <Section title="2. كيف نستخدم بياناتك">
        <ul className="list-disc pr-5 space-y-1">
          <li>إنشاء حسابك وإدارته وإرسال أكواد التحقق.</li>
          <li>عرض إعلانات العقارات الخاصة بك للمستخدمين الآخرين بعد الموافقة عليها.</li>
          <li>التواصل معك بخصوص حسابك أو إعلاناتك أو طلبات الاستفسار.</li>
          <li>تحسين تجربة المستخدم وأداء الموقع.</li>
        </ul>
      </Section>

      <Section title="3. مشاركة البيانات">
        <p>
          لا نبيع أو نؤجّر بياناتك الشخصية لأي طرف ثالث. قد تتم مشاركة بعض البيانات
          فقط في الحالات التالية:
        </p>
        <ul className="list-disc pr-5 space-y-1">
          <li>عرض رقم الموبايل أو وسيلة التواصل المرفقة بإعلان عقاري نشر على الموقع.</li>
          <li>عند طلب رسمي من جهة قانونية مختصّة.</li>
          <li>مع مزوّدي الخدمة التقنية (مثل الاستضافة) في أضيق الحدود اللازمة لتشغيل الموقع.</li>
        </ul>
      </Section>

      <Section title="4. حماية البيانات">
        <p>
          نستخدم تشفيرًا قويًا لكلمات المرور (Scrypt) واتصالًا آمنًا (HTTPS) لحماية
          بياناتك. على الرغم من ذلك، لا يمكن ضمان الأمان الكامل على الإنترنت بنسبة
          100%، لذا نوصي بالحفاظ على سرية بيانات الدخول.
        </p>
      </Section>

      <Section title="5. ملفات الكوكيز (Cookies)">
        <p>
          نستخدم ملفات تعريف الارتباط لإبقائك مسجّلاً للدخول وحفظ تفضيلاتك (مثل
          اللغة والوضع الداكن). يمكنك حذف الكوكيز من إعدادات المتصفح في أي وقت.
        </p>
      </Section>

      <Section title="6. حقوقك">
        <ul className="list-disc pr-5 space-y-1">
          <li>الاطّلاع على بياناتك من صفحة البروفايل وتعديلها.</li>
          <li>طلب حذف حسابك بالتواصل مع الإدارة عبر صفحة "تواصل معنا".</li>
          <li>الانسحاب من أي إشعارات أو رسائل تسويقية في أي وقت.</li>
        </ul>
      </Section>

      <Section title="7. التواصل">
        <p>
          لأي استفسار يخصّ الخصوصية أو طلب حذف بيانات، يمكنك التواصل معنا عبر
          الإيميل أو من خلال نموذج "تواصل معنا" داخل الموقع.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3
        className="text-base font-bold mb-2"
        style={{ color: "var(--gold-light)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
