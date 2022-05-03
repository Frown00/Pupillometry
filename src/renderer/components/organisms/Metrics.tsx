import { Col, Row } from 'antd';
import Statistic from 'antd/lib/statistic';
import type { ChartOption } from './SegmentedLineGraph';

/* eslint-disable react/jsx-no-undef */
interface IProps {
  respondentName: string;
  segmentName: string;
  classification: string;
  stats: IPupillometryStats;
  duration: number;
  sampleRate: number;
  baseline: number;
}

export default function Metrics(props: IProps) {
  const {
    respondentName,
    segmentName,
    stats,
    classification,
    duration,
    sampleRate,
    baseline,
  } = props;
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
          {classification === 'Valid' ? (
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
          <b>{segmentName ?? ''}</b>
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '1000px',
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
                value={stats.result.mean}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              {' '}
              <Statistic
                title="Std"
                value={stats.result.std}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              {' '}
              <Statistic
                title="Min"
                value={stats.result.min}
                precision={higherPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Max"
                value={stats.result.max}
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
              <Statistic title="Valid" value={stats.sample.valid} />
            </Col>
            <Col span={12}>
              <Statistic title="Raw" value={stats.sample.raw} />
            </Col>
            <Col span={12}>
              <Statistic
                title="Pupil Correlation"
                value={stats.result.correlation}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Eye difference [mm]"
                value={stats.result.difference}
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
                value={(stats.result.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12} />
            <Col span={12}>
              <Statistic
                title="Left"
                value={(stats.left.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Right"
                value={(stats.right.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
            </Col>
          </Row>
        </div>
        <div>
          <h3>
            <b>Info </b>
          </h3>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Statistic title="Sample Rate" value={sampleRate} />
            </Col>
            <Col span={12} />
            <Col span={12}>
              <Statistic
                title="Duration [s]"
                value={`${duration / 1000}`}
                precision={1}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Baseline"
                value={baseline}
                precision={lowerPrecision}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
