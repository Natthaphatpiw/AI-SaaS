import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

// Font size calculation function
function getFontSizeStyles(fontSize?: string) {
  const baseFontSize = fontSize ? parseInt(fontSize) : 12;
  
  return {
    headerName: { fontSize: `${Math.max(baseFontSize + 8, 16)}px` },
    headerJob: { fontSize: `${baseFontSize + 2}px` },
    sectionTitle: { fontSize: `${baseFontSize + 4}px` },
    workPosition: { fontSize: `${baseFontSize}px` },
    workDate: { fontSize: `${baseFontSize}px` },
    workCompany: { fontSize: `${Math.max(baseFontSize - 1, 9)}px` },
    workDescription: { fontSize: `${Math.max(baseFontSize - 1, 9)}px` },
    educationDegree: { fontSize: `${baseFontSize}px` },
    educationDate: { fontSize: `${baseFontSize}px` },
    educationSchool: { fontSize: `${Math.max(baseFontSize - 1, 9)}px` },
    summary: { fontSize: `${baseFontSize}px` },
    contact: { fontSize: `${Math.max(baseFontSize - 1, 9)}px` },
    skills: { fontSize: `${Math.max(baseFontSize - 1, 9)}px` },
  };
}

export default function ResumePreview({
  resumeData,
  contentRef,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  resumeData: ResumeValues;
}

function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    colorHex,
    borderStyle,
    fontSize,
  } = resumeData;

  const fontStyles = getFontSizeStyles(fontSize);
  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                  ? "9999px"
                  : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="font-bold"
            style={{
              color: colorHex,
              ...fontStyles.headerName,
            }}
          >
            {firstName} {lastName}
          </p>
          <p
            style={{
              color: colorHex,
              ...fontStyles.headerJob,
            }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-gray-500" style={fontStyles.contact}>
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex, fontSize } = resumeData;
  const fontStyles = getFontSizeStyles(fontSize);

  if (!summary) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="font-semibold"
          style={{
            color: colorHex,
            ...fontStyles.sectionTitle,
          }}
        >
          Professional profile
        </p>
        <div className="whitespace-pre-line" style={fontStyles.summary}>{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex, fontSize } = resumeData;
  const fontStyles = getFontSizeStyles(fontSize);

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="font-semibold"
          style={{
            color: colorHex,
            ...fontStyles.sectionTitle,
          }}
        >
          Work experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between font-semibold"
              style={{
                color: colorHex,
                ...fontStyles.workPosition,
              }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span style={fontStyles.workDate}>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="font-semibold" style={fontStyles.workCompany}>{exp.company}</p>
            <div className="whitespace-pre-line" style={fontStyles.workDescription}>{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex, fontSize } = resumeData;
  const fontStyles = getFontSizeStyles(fontSize);

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="font-semibold"
          style={{
            color: colorHex,
            ...fontStyles.sectionTitle,
          }}
        >
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between font-semibold"
              style={{
                color: colorHex,
                ...fontStyles.educationDegree,
              }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span style={fontStyles.educationDate}>
                  {edu.startDate &&
                    `${formatDate(edu.startDate, "MM/yyyy")} ${edu.endDate ? `- ${formatDate(edu.endDate, "MM/yyyy")}` : ""}`}
                </span>
              )}
            </div>
            <p className="font-semibold" style={fontStyles.educationSchool}>{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex, borderStyle, fontSize } = resumeData;
  const fontStyles = getFontSizeStyles(fontSize);

  if (!skills?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="font-semibold"
          style={{
            color: colorHex,
            ...fontStyles.sectionTitle,
          }}
        >
          Skills
        </p>
        <div className="flex break-inside-avoid flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                      ? "9999px"
                      : "8px",
                ...fontStyles.skills,
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
