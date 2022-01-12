/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import React from 'react';
import DefaultLoader from './Loader';
import ElectronWindow from '../ElectronWindow';
import { Channel } from '../../ipc/channels';

let ValidSchema: any = null;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  history?: any;
}

interface IStudy {
  name: string;
}
const { ipcRenderer } = ElectronWindow.get().api;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  isLoading: boolean;
  isSubmitting: boolean;
  studies: Array<IStudy>;
}

export default class CreateForm extends React.Component<IProps, IState> {
  state: Readonly<IState> = {
    isLoading: true,
    isSubmitting: false,
    studies: [],
  };

  componentDidMount() {
    ipcRenderer.send(Channel.RequestStudies);
    ipcRenderer.on(Channel.GetStudies, (value: any) => {
      if (value === 'Loading') {
        this.setState({ isLoading: true });
      } else {
        const studiesNames = value.map((s: IStudy) => s.name);
        ValidSchema = Yup.object().shape({
          name: Yup.string()
            .notOneOf(studiesNames, 'Study name must be unique')
            .min(3, 'Study name must be 3 characters at minimum')
            .required('Study name is required'),
        });
        this.setState({ isLoading: false, studies: value });
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetStudies);
  }

  render() {
    const { isLoading, isSubmitting } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return isLoading ? (
      <DefaultLoader />
    ) : (
      <div className="container">
        <div className="row mb-5">
          <div className="col-lg-12 text-center">
            <h1 className="mt-5">Create Study</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Formik
              initialValues={{
                name: '',
                setSubmitting: (switcher: boolean) => {
                  console.log(switcher);
                  self.setState({ isSubmitting: switcher });
                  console.log(isSubmitting);
                },
              }}
              validationSchema={ValidSchema}
              onSubmit={({ setSubmitting, ...values }) => {
                console.log('values', setSubmitting, values);
                setSubmitting(true);
                ipcRenderer.send(Channel.CreateStudy, values);
                self.props.history.push(`/study/${values.name}`);
                // alert('Form is validated! Submitting the form...', values);
                setSubmitting(false);
              }}
            >
              {({ touched, errors }) => (
                <Form>
                  <div className="form-group" style={{ marginBottom: '50px' }}>
                    <label htmlFor="name">Name</label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="Enter Study Name"
                      className={`form-control ${
                        touched.name && errors.name ? 'is-invalid' : ''
                      }`}
                    />
                    <ErrorMessage
                      component="div"
                      name="name"
                      className="invalid-feedback"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Please wait...' : 'Submit'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    );
  }
}
