import { Authenticated, GitHubBanner, Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import { dataProvider } from './data-provider';
import { App as AntdApp } from 'antd';
// import { useTranslation } from 'react-i18next';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { authProvider } from './auth-provider';
import { Header } from './components';
import { ColorModeContextProvider } from './contexts/color-mode';
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from './pages/categories';
import { ForgotPassword } from './pages/forgotPassword';
import { Login } from './pages/login';
import { Register } from './pages/register';

export function App() {
  // const { t, i18n } = useTranslation();

  // const i18nProvider = {
  //   translate: (key: string, params: object) => t(key, params),
  //   changeLocale: (lang: string) => i18n.changeLanguage(lang),
  //   getLocale: () => i18n.language,
  // };

  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(
                  'http://localhost:3000/api/platform/v1',
                )}
                authProvider={authProvider(
                  'http://localhost:3000/api/platform/v1',
                )}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                // i18nProvider={i18nProvider}
                resources={[
                  {
                    name: 'roles',
                    list: '/roles',
                    create: '/roles/create',
                    edit: '/roles/edit/:id',
                    show: '/roles/show/:id',
                    meta: {
                      canDelete: true,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: 'kyXfqs-Yvn9tE-nmJX7c',
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Header={() => <Header sticky />}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    {/*<Route*/}
                    {/*  index*/}
                    {/*  element={<NavigateToResource resource="blog_posts" />}*/}
                    {/*/>*/}
                    {/*<Route path="/blog-posts">*/}
                    {/*  <Route index element={<BlogPostList />} />*/}
                    {/*  <Route path="create" element={<BlogPostCreate />} />*/}
                    {/*  <Route path="edit/:id" element={<BlogPostEdit />} />*/}
                    {/*  <Route path="show/:id" element={<BlogPostShow />} />*/}
                    {/*</Route>*/}
                    <Route path="/roles">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}
