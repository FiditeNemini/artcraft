import { SectionTypography } from "./SectionTypography";
import { SectionComponents } from "./SectionComponents";

export const PageComponentLibrary = () => {
  return (
    <div
      className="fixed w-full overflow-scroll"
      style={{ height: "calc(100% - 72px)" }}
    >
      <div
        className='bg-ui-panel w-10/12 max-w-7xl mx-auto my-6 rounded-lg p-6'
      >
        <SectionTypography />
        <hr className="mt-2 mb-4" />
        <SectionComponents />
      </div>
    </div>
  );
}