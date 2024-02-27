import React, { CSSProperties } from "react";
import styled from "@emotion/styled";
import type { DraggableProvided } from "@hello-pangea/dnd";
import { Quote } from "./types";

interface Props {
  quote: Quote;
  isDragging: boolean;
  provided: DraggableProvided;
  isGroupedOver?: boolean;
  style?: CSSProperties;
  index?: number;
  isClone?: boolean;
}

const getBackgroundColor = (isDragging: boolean, isGroupedOver: boolean) => {
  if (isGroupedOver) {
    return "#EBECF0";
  }

    if (isDragging) {
      return "#EAE6FF";
    }

  return "#FFFFFF";
};

const getBorderColor = "transparent";

const imageSize = 40;


interface ContainerProps {
  isDragging: boolean;
  isGroupedOver: boolean;
}

const Container = styled.a<ContainerProps>`
  border-radius: 20px;
  border: 2px solid transparent;
  border-color: getBorderColor;
  background-color: ${(props) =>
    getBackgroundColor(props.isDragging, props.isGroupedOver)};
  box-shadow: ${({ isDragging }) =>
    isDragging ? `2px 2px 1px #A5ADBA` : "none"};
  box-sizing: border-box;
  padding: 8px;
  min-height: ${imageSize}px;
  margin-bottom: 8px;
  user-select: none;

  /* anchor overrides */
  color: #091e42;

  &:hover,
  &:active {
    color: rgb(22 101 52);
    text-decoration: none;
  }

  &:focus {
    outline: none;
    border-color: #b00fb0;
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
`;

const Content = styled.div`
  /* flex child */
  flex-grow: 1;

  /*
    Needed to wrap text in ie11
    https://stackoverflow.com/questions/35111090/why-ie11-doesnt-wrap-the-text-in-flexbox
  */
  flex-basis: 100%;

  /* flex parent */
  display: flex;
  flex-direction: column;
`;

const BlockQuote = styled.div`
  &::before {
    content: open-quote;
  }

  &::after {
    content: close-quote;
  }
`;

const Footer = styled.div`
  display: flex;
  margin-top: 8px;
  align-items: center;
`;

const QuoteId = styled.small`
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0;
  font-weight: normal;
  text-overflow: ellipsis;
  text-align: right;
`;

const getStyle = (
  provided: DraggableProvided,
  style?: CSSProperties | null
) => {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style,
  };
};

const QuoteItem = (props: Props) => {
  const { quote, isDragging, provided, isGroupedOver, style, index, isClone } =
    props;

  return (
    <Container
      isDragging={isDragging}
      isGroupedOver={Boolean(isGroupedOver)}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-testid={quote.index}
      data-index={index}
    >
      <Content>
        <BlockQuote>{quote.text}</BlockQuote>
        <Footer>
          <QuoteId>index: {quote.index}</QuoteId>
        </Footer>
      </Content>
    </Container>
  );
};

export default React.memo<Props>(QuoteItem);
