import React from "react";

interface CertificateProps {
  studentName: string;
  packageName: string;
  correct: number;
  total: number;
  score: number;
  startDate: string;
  endDate: string;
  logoSrc?: string;
  signatureSrc?: string;
  backgroundFrame?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  packageName,
  correct,
  total,
  score,
  startDate,
  endDate,
  logoSrc = "/logo.png",
  backgroundFrame = "/background.png",
  signatureSrc = "/signature.png",
}) => {
  return (
    <div className="bg-white flex scroll overflow-x-auto min-h-screen w-full">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "900px",
          height: "640px",
          backgroundImage: `url(${backgroundFrame})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex flex-col justify-between rounded-lg shadow-lg "
          style={{
            width: "780px",
            height: "520px",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6 pl-8 pr-4">
            {/* Centered Logo */}
            {/* Center Names */}
            <div className="flex flex-row justify-between items-center gap-2">
              <div className="text-sm font-bold">
                ዳሩል ኩብራ የቁርአንና የዲን ትምህርት ማዕከል
              </div>
              <div className="flex justify-center mb-1 ml-22 pt-4">
                <img src={logoSrc} alt="Logo" className="h-20" />
              </div>
              <div className="text-sm font-bold">
                DARUL KUBRA QURAN AND ISLAMIC STUDIES CENTER
              </div>
            </div>
            <h1 className="text-xl font-bold mt-2">
              مركز دار الكبرى لتعليم القرآن والعلوم الدينية
            </h1>
          </div>
          {/* English & Arabic Sections Side by Side */}
          <div className="flex flex-row gap-3 mb-2 h-full">
            {/* English Section */}
            {/* <div className="w-1/2 text-center border-r pr-3 pl-6">
              <h2 className="text-base font-bold mb-2">
                CoursesPackage Certificate
              </h2>
              <p className="text-xs leading-snug">
                Dar Al-Kubra Quran and Islamic Studies Center certifies that the
                student,
                <span className="font-bold"> {studentName} </span>, has
                completed the memorization of the courses package
                <span className="font-bold"> {packageName} </span>
                during the period from
                <span className="font-bold"> {startDate} </span>
                to
                <span className="font-bold"> {endDate} </span>, answering
                <span className="font-bold"> {correct} </span>
                of
                <span className="font-bold"> {total} </span>
                questions, scoring
                <span className="font-bold">{score * 100}%</span>. The center,
                as it grants him/her this certificate, recommends him/her to
                have piety towards Allah and to use what he/she has learned in
                his/her pursuit of noble Islamic knowledge.
              </p>
            </div> */}
            {/* Amharic Section */}
            <div className="w-1/2 text-center border-r pr-3 pl-6">
              <h2 className="text-base font-bold mb-2">
                የኮርሶች ጥቅል ማጠናቀቂያ የምስክር
              </h2>
              <p className="text-s leading-snug">
                ዳር አል-ኩብራ የቁርዓን እና ኢስላሚክ ጥናት ማእከል ተማሪ
                <span className="font-bold"> {studentName} </span> ከ
                <span className="font-bold"> {startDate} </span>
                እስከ
                <span className="font-bold"> {endDate} </span> ባለው ጊዜ ውስጥ የ
                <span className="font-bold"> {packageName} </span>
                ኮርሶችን ፓኬጅ ማጠናቀቁን/ቋን እና ከ
                <span className="font-bold"> {total} </span>
                ጥያቄዎች
                <span className="font-bold"> {correct} </span>
                ን በመመለስ
                <span className="font-bold">{score * 100}%</span>: ያገኘ/ች መሆኑን/ኗን
                ያረጋግጣል።
                <p className="mt-2 mb-2 text-s leading-snug">
                  ማዕከሉ ይህንን ሰርተፍኬት ሲሰጠው/ጣት አላህን በመፍራት እና የተማረውን/ችውን ኢስላማዊ እውቀት
                  በመተግበር ላይ ይመክራል።
                </p>
              </p>
            </div>
            {/* Arabic Section */}
            <div
              dir="rtl"
              className="text-right font-arabic w-1/2 pr-3 font-[Noto Naskh Arabic] mr-4"
            >
              <p className="text-base font-bold text-center mb-2">
                شهادة إتمام مجلد الدورات
              </p>
              <p className="text-s leading-snug">
                يشهد مركز الدار الكبرى للقرآن الكريم والدراسات الإسلامية أن
                الطالب،
                <span className="font-bold"> {studentName} </span>
                قد أتم\ت حزمة دورات
                <span className="font-bold"> {packageName} </span>
                خلال الفترة من
                <span className="font-bold"> {startDate} </span>
                إلى
                <span className="font-bold"> {endDate} </span>
                مجيبًا على
                <span className="font-bold"> {correct} </span>
                أسئلة من أصل
                <span className="font-bold"> {total} </span>
                محققًا نسبة
                <span className="font-bold">%{(score * 100).toFixed(2)}</span> .
              </p>
              <p className="mt-2 mb-2 text-s leading-snug">
                ويوصي المركز، إذ يمنحه\تمنحه هذه الشهادة، بتقوى الله وأن
                يوظف\توظف ما تعلمه\ته في تحصيل العلوم الشرعية النبيلة.
              </p>
            </div>
          </div>
          {/* Signatures */}
          <div className="flex justify-between items-center mt-2 pb-6">
            <div className="text-center ml-20">
              <div className="">
                <img
                  src={signatureSrc}
                  alt="Signature"
                  className="h-12 mx-auto"
                />
              </div>
              <p className="font-bold">Director of the center</p>
            </div>
            <div className="text-center mr-30">
              <div className="">
                <img
                  src={signatureSrc}
                  alt="Signature"
                  className="h-12 mx-auto"
                />
              </div>
              <p className="font-bold">مدير المركز</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
