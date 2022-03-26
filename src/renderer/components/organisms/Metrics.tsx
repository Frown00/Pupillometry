import { Col, Row } from 'antd';
import Statistic from 'antd/lib/statistic';

/* eslint-disable react/jsx-no-undef */
interface IProps {
  respondentName: string;
  samples: IPupillometry;
}

export default function Metrics(props: IProps) {
  const { respondentName, samples } = props;
  const { stats, isValid } = samples;
  const higherPrecision = 4;
  const lowerPrecision = 2;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '600px',
        }}
      >
        <div>
          {isValid ? (
            <h2 style={{ color: '#a0d911' }}>
              <b>VALID</b>
            </h2>
          ) : (
            <h2 style={{ color: '#f5222d' }}>
              <b>INVALID</b>
            </h2>
          )}
        </div>
        <p style={{ display: 'flex' }}>
          <span className="pupil-label">Respondent:</span>{' '}
          <b>{respondentName}</b>
        </p>
        <p style={{ display: 'flex' }}>
          <span className="pupil-label">Segment:</span>{' '}
          <b>{samples?.name ?? ''}</b>
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '800px',
          marginBottom: '50px',
        }}
      >
        <div>
          <h3>
            <b>Metrics</b>
          </h3>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Statistic
                title="Mean"
                value={stats.mean}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              {' '}
              <Statistic
                title="Std"
                value={stats.std}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              {' '}
              <Statistic
                title="Min"
                value={stats.min}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Max"
                value={stats.max}
                precision={higherPrecision}
              />
            </Col>
          </Row>
        </div>

        <div>
          <h3>
            <b>Samples</b>
          </h3>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Statistic title="Valid" value={stats.validSamples} />
            </Col>
            <Col span={12}>
              <Statistic title="Raw" value={stats.rawSamplesCount} />
            </Col>
            <Col span={12}>
              <Statistic
                title="Pupil Correlation"
                value={stats.pupilCorrelation}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Eye difference [mm]"
                value={stats.meanPupilDifference}
                precision={lowerPrecision}
              />
            </Col>
          </Row>
          <div
            style={{
              display: 'flex',
              width: '220px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          />
        </div>
        <div>
          <h3>
            <b>Missing [%] </b>
          </h3>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Statistic
                title="Both"
                value={(stats.missing.general / stats.rawSamplesCount) * 100}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12} />
            <Col span={12}>
              <Statistic
                title="Left"
                value={(stats.missing.leftPupil / stats.rawSamplesCount) * 100}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Right"
                value={(stats.missing.rightPupil / stats.rawSamplesCount) * 100}
                precision={lowerPrecision}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}