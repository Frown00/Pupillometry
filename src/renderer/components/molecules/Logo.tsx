import styled from 'styled-components';
import Icon from '../../../../assets/icons/256x256.png';

const Wrapper = styled.div`
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
`;

const ImageStyle = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
`;

export default function Logo() {
  return (
    <Wrapper>
      <ImageStyle
        src={Icon}
        alt="Image of Application Logo - white P letter on black background"
      />
    </Wrapper>
  );
}
