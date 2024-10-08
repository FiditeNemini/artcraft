import { ChangeEvent } from "react";
import { faFont } from "@fortawesome/pro-solid-svg-icons";
import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { HexColorPicker } from "react-colorful";

import { Textarea, TextareaInterface, ResizeType } from "../TextArea";
import { InputNumber } from "../InputNumber";
import { Combobox } from "../ComboBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonsAlignments } from "./ButtonsAlignment";
import { ButtonsTextStyles } from "./ButtonTextStyles";

import {
  TextFormatData,
  TextAlign,
  TextDecoration,
  FontStyle,
  FontWeight,
} from "./types";

const FontFamilies = ["Arial", "Helvetica", "Times New Roman", "Comic Sans MS"];

export const TextEditor = ({
  text,
  formatData,
  onChangeText,
  onChangeFormatting,
  TextareaProps,
}: {
  text: string;
  formatData: TextFormatData;
  onChangeText: (newText: string) => void;
  onChangeFormatting: (newFormatData: Partial<TextFormatData>) => void;
  TextareaProps?: TextareaInterface;
}) => {
  const handleOnChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeText(e.target.value);
  };
  const onChangeTextAlignment = (newAlignment: TextAlign) => {
    onChangeFormatting({
      textAlign: newAlignment,
    });
  };
  const onChangeFontStyle = (newStyle: FontStyle) => {
    onChangeFormatting({
      fontStyle: newStyle,
    });
  };
  const onChangeFontWeight = (newWeight: FontWeight) => {
    onChangeFormatting({
      fontWeight: newWeight,
    });
  };
  const onChangeTextDecoration = (newDecor: TextDecoration) => {
    onChangeFormatting({
      textDecoration: newDecor,
    });
  };
  const onChangeFontFamily = (newFontFamily: string) => {
    onChangeFormatting({
      fontFamily: newFontFamily,
    });
  };
  const onChangeTextColor = (newTextColor: string) => {
    onChangeFormatting({
      color: newTextColor,
    });
  };
  const onChangeFontSize = (newVal: number) => {
    onChangeFormatting({
      fontSize: newVal,
    });
  };

  const TextAreaStates = {
    style: {
      ...formatData,
      width: "500px",
    },
    rows: 7,
    placeholder: "...",
    resize: "none" as ResizeType,
    onChange: handleOnChangeText,
    value: text,
  };
  const unionTextAreaProps = {
    ...TextareaProps,
    ...TextAreaStates,
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Combobox
          options={FontFamilies}
          value={formatData.fontFamily}
          onChange={onChangeFontFamily}
        />
        <Popover className="relative">
          <PopoverButton className="flex size-10 flex-col items-center gap-1 rounded-md border p-2">
            <FontAwesomeIcon icon={faFont} />
            <span
              className="h-1 w-full"
              style={{ backgroundColor: formatData.color }}
            />
          </PopoverButton>
          <PopoverPanel anchor="bottom" className="flex flex-col">
            <HexColorPicker
              color={formatData.color}
              onChange={onChangeTextColor}
            />
            <p>{formatData.color}</p>
            <CloseButton>OK</CloseButton>
          </PopoverPanel>
        </Popover>
        <InputNumber value={formatData.fontSize} onChange={onChangeFontSize} />
      </div>
      <div className="flex items-center gap-4">
        <ButtonsAlignments
          value={formatData.textAlign}
          onChange={onChangeTextAlignment}
        />
        <ButtonsTextStyles
          fontWeight={formatData.fontWeight}
          fontStyle={formatData.fontStyle}
          textDecoration={formatData.textDecoration}
          onChangeFontWeight={onChangeFontWeight}
          onChangeFontStyle={onChangeFontStyle}
          onChangeTextDecoration={onChangeTextDecoration}
        />
      </div>
      <Textarea {...unionTextAreaProps} />
    </div>
  );
};
