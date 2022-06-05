import { Col, Row, Space, Tabs } from 'antd';
import Statistic from 'antd/lib/statistic';

const { TabPane } = Tabs;

/* eslint-disable react/jsx-no-undef */
interface IProps {
  respondent: IPupillometryResult | null;
  segment: IPupillometry;
  isSmoothed: boolean;
  stats: IPupillometryStats;
}

export default function Metrics(props: IProps) {
  const { respondent, segment, isSmoothed, stats } = props;
  const higherPrecision = 4;
  const lowerPrecision = 2;
  const {
    meanGrand = null,
    stdGrand = null,
    name: respondentName = '',
  } = respondent as IPupillometryResult;
  const {
    classification,
    sampleRate,
    duration,
    name: segmentName,
    baseline,
  } = segment;
  const preferedResult = isSmoothed ? stats.resultSmoothed : stats.result;
  return (
    <>
      <Space direction="horizontal" size="large">
        <Space>
          {classification === 'Valid' ? (
            <h2 style={{ color: '#a0d911' }}>
              <b>VALID</b>
            </h2>
          ) : (
            <h2 style={{ color: '#f5222d' }}>
              <b>INVALID</b>
            </h2>
          )}
        </Space>
        <Space>
          <span className="pupil-label">Respondent:</span>{' '}
          <b>{respondentName}</b>
        </Space>
        <Space>
          <span className="pupil-label">Segment:</span>{' '}
          <b>{segmentName ?? ''}</b>
        </Space>
      </Space>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="large"
        style={{ height: '350px' }}
      >
        <TabPane tab="General" key="1">
          <Row gutter={[100, 40]}>
            <Col>
              <Statistic
                title="Mean"
                value={preferedResult.mean}
                precision={higherPrecision}
              />
              <Statistic
                title="Std"
                value={preferedResult.std}
                precision={higherPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Min"
                value={preferedResult.min}
                precision={higherPrecision}
              />
              <Statistic
                title="Max"
                value={preferedResult.max}
                precision={higherPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Baseline"
                value={baseline?.value}
                precision={higherPrecision}
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Sample" key="2">
          <Row gutter={[100, 100]}>
            <Col>
              <Statistic title="Raw" value={stats.sample.raw} />
              <Statistic title="Valid" value={stats.sample.valid} />
            </Col>
            <Col>
              <Statistic title="Rate [Hz]" value={sampleRate} />
              <Statistic
                title="Duration [s]"
                value={duration / 1000}
                precision={lowerPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Missing [%]"
                value={(stats.sample.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
              <Statistic
                title="Left [%]"
                value={(stats.left.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
              <Statistic
                title="Right [%]"
                value={(stats.right.missing / stats.sample.raw) * 100}
                precision={lowerPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Difference [mm]"
                value={stats.sample.difference}
                precision={lowerPrecision}
              />
              <Statistic
                title="Correlation"
                value={stats.sample.correlation}
                precision={lowerPrecision}
              />
            </Col>
            <Col />
          </Row>
        </TabPane>
        <TabPane tab="Extra" key="3">
          <Row gutter={[100, 100]}>
            <Col>
              <Statistic
                title="Mean Grand"
                value={isSmoothed ? meanGrand?.smoothed : meanGrand?.normal}
                precision={higherPrecision}
              />
              <Statistic
                title="Std Grand"
                value={isSmoothed ? stdGrand?.smoothed : stdGrand?.normal}
                precision={higherPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Left mean"
                value={stats.left.mean}
                precision={lowerPrecision}
              />
              <Statistic
                title="Std"
                value={stats.left.std}
                precision={lowerPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Min"
                value={stats.left.min}
                precision={lowerPrecision}
              />
              <Statistic
                title="Max"
                value={stats.left.max}
                precision={lowerPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Right mean"
                value={stats.right.mean}
                precision={lowerPrecision}
              />
              <Statistic
                title="Std"
                value={stats.right.std}
                precision={lowerPrecision}
              />
            </Col>
            <Col>
              <Statistic
                title="Min"
                value={stats.right.min}
                precision={lowerPrecision}
              />
              <Statistic
                title="Max"
                value={stats.right.max}
                precision={lowerPrecision}
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </>
  );
}
