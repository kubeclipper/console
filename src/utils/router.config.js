/*
 * Copyright 2021 KubeClipper Authors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { isString, isObject } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export const renderRoutes = (routes, extraProps = {}, switchProps = {}) =>
  routes ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => {
        const key = route.key || i;

        if (route.redirect) {
          const { redirect } = route;

          if (isString(redirect)) return <Redirect key={key} to={redirect} />;

          if (isObject(redirect)) {
            return <Redirect key={key} {...redirect} />;
          }
        }
        return (
          <Route
            key={key}
            exact={route.exact}
            path={route.path}
            render={(props) => {
              if (route.render) {
                return route.render(props);
              }
              return (
                <route.component {...props} {...extraProps} route={route} />
              );
            }}
            strict={route.strict}
          />
        );
      })}
    </Switch>
  ) : null;
