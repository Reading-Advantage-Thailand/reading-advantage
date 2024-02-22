import React, { CSSProperties, ReactElement } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { Quote, WrapperProps, InnerListProps, QuoteListProps } from "./types";
import styled from "@emotion/styled";
import QuoteItem from "./quote-item";

type Props = {
  listId?: string;
  listType?: string;
  title?: string;
  quotes?: Quote[];
  internalScroll?: boolean;
  scrollContainerStyle?: CSSProperties;
  isDropDisabled?: boolean;
  isCombineEnabled?: boolean;
  style?: CSSProperties;
  ignoreContainerClipping?: boolean;
  useClone?: boolean;
  key?: number;
};

const getBackgroundColor = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean
): string => {
  if (isDraggingOver) {
    return "#FFEBE6";
  }
  if (isDraggingFrom) {
    return "#E6FCFF";
  }
  return "#EBECF0";
};

const Wrapper = styled.div<WrapperProps>`
  background-color: ${(props) =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : "inherit")};
  padding: 8px;
  border: 8px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 100%;
`;

const scrollContainerHeight = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;

  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: 8px;
`;

// const ScrollContainer = styled.div`
//   overflow-x: hidden;
//   overflow-y: auto;
//   max-height: ${scrollContainerHeight}px;
// `;

const Container = styled.div``;

const InnerQuoteList = (props: QuoteListProps) => {
  return (
    <>
      {props.quotes.map((quote, index) => (
        <Draggable key={quote.index} draggableId={quote.index} index={index}>
          {(
            dragProvided: DraggableProvided,
            dragSnapshot: DraggableStateSnapshot
          ) => (
            <>              
              <QuoteItem
                key={quote.index}
                quote={quote}
                isDragging={dragSnapshot.isDragging}
                isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                provided={dragProvided}
              />
            </>
          )}
        </Draggable>
      ))}
    </>
  );
};

const InnerQuoteListMemo = React.memo<QuoteListProps>(InnerQuoteList);

const InnerList = (props: InnerListProps) => {
  const { quotes, dropProvided } = props;
  return (
    <Container>
      <DropZone ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
        <p>{props.listType}</p>
        <InnerQuoteListMemo quotes={quotes} />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
};

const Title = styled.h4`
  padding: 8px;
  transition: background-color ease 0.2s;
  flex-grow: 1;
  user-select: none;
  position: relative;

  &:focus {
    outline: 2px solid #998dd9;
    outline-offset: 2px;
  }
`;

export default function QuoteList({
  listId = "List",
  listType,
  title,
  internalScroll,
  scrollContainerStyle,
  isDropDisabled = false,
  isCombineEnabled,
  style,
  ignoreContainerClipping,
  quotes,
  useClone,
}: Props) {
  return (
    <Droppable
      droppableId={listId}
        type={listType}
        ignoreContainerClipping={ignoreContainerClipping}
        isDropDisabled={isDropDisabled}
        isCombineEnabled={isCombineEnabled} 
    >
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <Wrapper
          isDraggingOver={snapshot.isDraggingOver}
          isDropDisabled={Boolean(isDropDisabled)}
          isDraggingFrom={Boolean(snapshot.draggingFromThisWith)}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <InnerList
            quotes={quotes || []} // Add default value for quotes prop
            // title={title}
            dropProvided={provided}
            listType={listType}
          />
        </Wrapper>
      )}
    </Droppable>
  );
}
