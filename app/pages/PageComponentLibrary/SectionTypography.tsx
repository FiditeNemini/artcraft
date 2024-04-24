import { 
  H1,H2,H3,H4,H5,H6,P,Label,
} from "~/components";


export const SectionTypography = () => {

  return(
    <div className="flex flex-col gap-2 mb-4">
      <H1>Typography</H1>
      <H1>H1. This is an H1 Heading</H1>
      <H2>H2. This is an H2 Heading</H2>
      <H3>H3. This is an H3 Heading</H3>
      <H4>H4. This is an H4 Heading</H4>
      <Label>Label. Is essentially same as H4</Label>
      <P>P. Is an normal Paragraph</P>
      <H5>H5. This is an H5 Heading</H5>
      <H6>H6. This is an H6 Heading</H6>
    </div>
  );
};