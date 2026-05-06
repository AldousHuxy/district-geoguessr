import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import routes from '.';
const App = lazy(() => import('@/App.tsx'));
const MainMenu = lazy(() => import('@/pages/MainMenu/index.tsx'));
const Game = lazy(() => import('@/pages/Game/index.tsx'));
const HighScores = lazy(() => import('@/pages/HighScores/index.tsx'));

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path={routes.app} element={<App />}>
            <Route path={routes.menu} element={<MainMenu />} />
            <Route path={routes.game} element={<Game />} />
            <Route path={routes.highScores} element={<HighScores />} />
            <Route path={routes.unknown} element={<Navigate to={routes.menu} />} />
        </Route>
    ),
    { basename: '/district-geoguessr' }
);