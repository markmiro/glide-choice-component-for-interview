import { useCallback, useState } from "react";
import { useHover, useLayer } from "react-laag";
import s from "./Choice.module.css";
import { CurrentChoice, MenuItem } from "./MenuItem";
import { SearchChoices } from "./SearchChoices";
import { ChoiceProps, ChoiceType } from "./types";
import { useCurrentChoice } from "./useCurrentChoice";
import { useOnWindowEscape } from "./useOnWindowEscape";

console.log("loaded DesktopChoice!");

function MenuItemWithChildren({
  choice,
  onChooseId,
  chosenId,
}: {
  choice: ChoiceType;
  chosenId: string;
  onChooseId: (id: string) => void;
}) {
  const [isOpen, hoverProps, close] = useHover({
    delayEnter: 0,
    delayLeave: 0,
    hideOnScroll: false,
  });

  const { triggerProps, layerProps, renderLayer } = useLayer({
    isOpen,
    placement: "right-start",
    possiblePlacements: ["right-start", "left-start"],
    containerOffset: 0,
    auto: true,
    onOutsideClick: close,
    onParentClose: close,
  });

  return (
    <>
      <MenuItem
        key={choice.id}
        choice={choice}
        chosenId={chosenId}
        onChooseId={onChooseId}
        {...hoverProps}
        {...triggerProps}
      />
      {isOpen &&
        choice.children &&
        choice.children.length > 0 &&
        renderLayer(
          <div {...layerProps} {...hoverProps} className={s.menu}>
            <MenuItems
              choices={choice.children}
              onChooseId={onChooseId}
              chosenId={chosenId}
            />
          </div>
        )}
    </>
  );
}

function MenuItems({
  choices,
  onChooseId,
  chosenId,
}: {
  choices: ChoiceType[];
  chosenId: string;
  onChooseId: (id: string) => void;
}) {
  return (
    <>
      {choices.map((choice) =>
        choice.children && choice.children.length > 0 ? (
          <MenuItemWithChildren
            key={choice.id}
            choice={choice}
            chosenId={chosenId}
            onChooseId={onChooseId}
          />
        ) : (
          <MenuItem
            key={choice.id}
            choice={choice}
            chosenId={chosenId}
            onChooseId={onChooseId}
          />
        )
      )}
    </>
  );
}

export function DesktopChoice({ choices, state }: ChoiceProps) {
  const [chosenId, setChosenId] = state ?? ["", () => {}];
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const currentChoice = useCurrentChoice(chosenId, choices);

  // actions
  const open = () => setIsOpen(true);
  const close = useCallback(() => setIsOpen(false), []);
  const select = (id: ChoiceType["id"]) => {
    setChosenId(id);
    // close();
  };
  // misc
  useOnWindowEscape(close);

  const { triggerProps, layerProps, renderLayer } = useLayer({
    isOpen,
    placement: "bottom-start",
    containerOffset: 0,
    auto: true,
    onOutsideClick: close,
  });

  return (
    <>
      <button className={s.choiceButton} {...triggerProps} onClick={open}>
        <CurrentChoice choice={currentChoice} />
      </button>
      {isOpen &&
        renderLayer(
          <div {...layerProps} className={s.menu}>
            <SearchChoices
              value={search}
              onChange={setSearch}
              choices={choices}
            />
            {!search &&
              choices.map((choice) =>
                choice.children ? (
                  <MenuItemWithChildren
                    key={choice.id}
                    choice={choice}
                    chosenId={chosenId}
                    onChooseId={select}
                  />
                ) : (
                  <MenuItem
                    key={choice.id}
                    choice={choice}
                    chosenId={chosenId}
                    onChooseId={select}
                  />
                )
              )}
          </div>
        )}
    </>
  );
}

export default DesktopChoice;
