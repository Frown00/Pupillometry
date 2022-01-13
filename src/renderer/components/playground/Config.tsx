// // /* eslint-disable react/no-unused-state */
// // /* eslint-disable react/state-in-constructor */
// // /* eslint-disable jsx-a11y/label-has-associated-control */
// // import { Formik, Form, Field, ErrorMessage } from 'formik';
// // import * as Yup from 'yup';

// // import 'bootstrap/dist/css/bootstrap.css';
// // import React from 'react';

// // const ValidSchema: any = null;

// // // eslint-disable-next-line @typescript-eslint/no-empty-interface
// // interface IProps {
// //   defaultConfig: IConfig;
// // }

// // interface IStudy {
// //   name: string;
// // }
// // // eslint-disable-next-line @typescript-eslint/no-empty-interface
// // interface IState {
// //   studies: Array<IStudy>;
// // }

// // export default class Config extends React.Component<IProps, IConfig> {
// //   state: Readonly<IConfig> = {
// //     file: {},
// //     chart: {},
// //     processing: {},
// //   };

// //   constructor(props: IProps) {
// //     super(props);
// //     this.state = {
// //       file: props.defaultConfig.file,
// //       chart: props.defaultConfig.chart,
// //       processing: props.defaultConfig.processing,
// //     };
// //   }

// //   render() {
// //     const { isLoading, isSubmitting } = this.state;
// //     // eslint-disable-next-line @typescript-eslint/no-this-alias
// //     const self = this;
// //     return isLoading ? (
// //       <DefaultLoader />
// //     ) : (
// //       <div className="container">
// //         <div className="row mb-5">
// //           <div className="col-lg-12 text-center">
// //             <h1 className="mt-5">Create Study</h1>
// //           </div>
// //         </div>
// //         <div className="row">
// //           <div className="col-lg-12">
// //             <Formik
// //               initialValues={{
// //                 name: '',
// //                 setSubmitting: (switcher: boolean) => {
// //                   console.log(switcher);
// //                   self.setState({ isSubmitting: switcher });
// //                   console.log(isSubmitting);
// //                 },
// //               }}
// //               validationSchema={ValidSchema}
// //               onSubmit={({ setSubmitting, ...values }) => {
// //                 console.log('values', setSubmitting, values);
// //                 setSubmitting(true);
// //                 ipcRenderer.send(Channel.CreateStudy, values);
// //                 self.props.history.push(`/study/${values.name}`);
// //                 // alert('Form is validated! Submitting the form...', values);
// //                 setSubmitting(false);
// //               }}
// //             >
// //               {({ touched, errors }) => (
// //                 <Form>
// //                   <div className="form-group" style={{ marginBottom: '50px' }}>
// //                     <label htmlFor="name">Name</label>
// //                     <Field
// //                       type="text"
// //                       name="name"
// //                       placeholder="Enter Study Name"
// //                       className={`form-control ${
// //                         touched.name && errors.name ? 'is-invalid' : ''
// //                       }`}
// //                     />
// //                     <ErrorMessage
// //                       component="div"
// //                       name="name"
// //                       className="invalid-feedback"
// //                     />
// //                   </div>
// //                   <button
// //                     type="submit"
// //                     className="btn btn-primary btn-block"
// //                     disabled={isSubmitting}
// //                   >
// //                     {isSubmitting ? 'Please wait...' : 'Submit'}
// //                   </button>
// //                 </Form>
// //               )}
// //             </Formik>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }
// // }
// const DEFAULT_CONFIG: IConfig = {
//   file: {
//     separator: ',',
//     timestamp: 'Timestamp',
//     leftPupil: 'ET_PupilLeft',
//     rightPupil: 'ET_PupilRight',
//     segmentId: '',
//   },
//   chart: {
//     width: 800,
//     height: 800,
//   },
//   processing: {
//     pupil: {
//       eye: 'both', // left, right, both,
//       showEyesPlot: true, // chart includes both eyes scatterplots
//       mean: true, // chart includes mean based on selected eye
//       baseline: 3.0, // mm
//       min: 1.5, // mm
//       max: 9, // mm
//       acceptableDifferance: 0.5, // mm
//     },
//     extraFilters: {
//       dilatationSpeed: true,
//       trandLineDeviation: true,
//       temporallyIsolatedSamples: true,
//     },
//     resampling: {
//       on: true,
//       rate: 1000, // Hz
//     },
//     interpolation: {
//       on: true,
//       acceptableGap: 250, // ms
//     },
//     smoothing: {
//       on: true,
//       cutoffFrequency: 4, // Hz
//     },
//   },
// };
