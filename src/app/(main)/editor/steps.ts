import { EditorFormProps } from "@/lib/types";
import EducationForm from "./forms/EducationForm";
import GeneralInfoForm from "./forms/GeneralInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SkillsForm from "./forms/SkillsForm";
import SummaryForm from "./forms/SummaryForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";

export const steps: {
  titleKey: string;
  component: React.ComponentType<EditorFormProps>;
  key: string;
}[] = [
  { titleKey: "editor.steps.generalInfo", component: GeneralInfoForm, key: "general-info" },
  { titleKey: "editor.steps.personalInfo", component: PersonalInfoForm, key: "personal-info" },
  {
    titleKey: "editor.steps.workExperience",
    component: WorkExperienceForm,
    key: "work-experience",
  },
  { titleKey: "editor.steps.education", component: EducationForm, key: "education" },
  { titleKey: "editor.steps.skills", component: SkillsForm, key: "skills" },
  {
    titleKey: "editor.steps.summary",
    component: SummaryForm,
    key: "summary",
  },
];
