import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';

import CountdownLoader from './CountdownLoader';
import { LANGUAGES } from '../constants/lang';
import { POKEMON_NAMES } from '../constants/pokemon';
import { useAppDispatch } from '../store';
import { goToNextPokemon } from '../store/actions';
import { revealPokemon } from '../store/gameSlice';
import { useCurrentPokemonNumber, useGameState, useLang, useSettings } from '../util/hooks';
import { removeAccents, soundAlike } from '../util/spelling';

// Utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AnswerInput = () => {
  const dispatch = useAppDispatch();
  const lang = useLang();
  const settings = useSettings();
  const gameState = useGameState();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputRecentlyFocused, setIsInputRecentlyFocused] = useState(false);
  const onInputFocus = useCallback(() => setIsInputRecentlyFocused(true), []);
  const onInputBlur = useCallback(() => {
    setTimeout(() => setIsInputRecentlyFocused(false), 200);
  }, []);

  const [guess, setGuess] = useState('');
  const handleClick = () => {
    dispatch(goToNextPokemon());
  };
  const number = useCurrentPokemonNumber();
  const pokemonNames = useMemo(() => (
    POKEMON_NAMES.find((pokemon) => pokemon.number === number)!.names
  ), [number]);

  const checkGuess = (guess: string) => {
    const normalisedGuess = removeAccents(guess.toLowerCase());
    const normalisedAnswer = removeAccents(pokemonNames[settings.language]);

    if (
      (settings.forgivingSpellingEnabled && settings.language === 'en' && soundAlike(normalisedGuess, normalisedAnswer))
      || (normalisedGuess === normalisedAnswer)) {
      dispatch(revealPokemon({ isCorrect: true }));
      setGuess(pokemonNames[settings.language]);
    }
  };

  const onInput = (ev: JSXInternal.TargetedInputEvent<HTMLInputElement>) => {
    if (!gameState.answered) {
      setGuess(ev.currentTarget.value);
      checkGuess(ev.currentTarget.value);
    } else {
      ev.currentTarget.value = guess;
    }
  };

  const onKeyDown = (ev: JSXInternal.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (gameState.answered) {
      ev.preventDefault();

      if (ev.key === 'Enter') {
        dispatch(goToNextPokemon());
      }
    }
  };

  const onGiveUp = () => {
    if (isInputRecentlyFocused) {
      inputRef.current?.focus();
    }

    dispatch(revealPokemon({ isCorrect: false }));
    setGuess(pokemonNames[settings.language]);
  };

  useEffect(() => {
    if (!gameState.answered) {
      setGuess('');
    }
  }, [number]);

  const correctName = pokemonNames.en;

  const randomIndexes = useMemo(() => {
    const indexes = new Set<number>();
    while (indexes.size < 2) {
      const index = Math.floor(Math.random() * POKEMON_NAMES.length);
      if (POKEMON_NAMES[index].names.en !== correctName) {
        indexes.add(index);
      }
    }
    return Array.from(indexes);
  }, [correctName]);

  const incorrectNames = randomIndexes.map(index => POKEMON_NAMES[index].names.en);

  const buttonNames = useMemo(() => {
    const names = [correctName, ...incorrectNames].map(capitalizeFirstLetter);
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    return names;
  }, [correctName, incorrectNames]);

  return (
    <div className="answer-area">
      <div className="answer-input-container">
        <input
          type="text"
          className={`answer-input ${gameState.answered ? 'answer-input-correct' : ''}`}
          name="pokemonGuess"
          autocomplete="off"
          autocorrect="off"
          tabindex={1}
          spellcheck={false}
          onInput={onInput}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={onKeyDown}
          value={guess}
          ref={inputRef}
          {...(process.env.NODE_ENV !== 'production' ? {
            'data-pokemon-number': number,
          } : {})}
        />

        {gameState.answered && <CountdownLoader />}

        <span className="progress-counter">
          {`${gameState.pokemon.currentIndex + 1} / ${gameState.pokemon.numbers.length}`}
        </span>
      </div>

      {gameState.answered ? (
        <div className="also-known-as">
          <h2 onClick={handleClick}>Next!<br></br>(Type Enter ⏎ Above)</h2>
          <ul>
            {Object.values(LANGUAGES)
              .filter((lang) => lang.code !== settings.language)
              .map((lang) => (
                <li key={lang.code}>
                  <img src={lang.flagUrl} />
                  {pokemonNames[lang.code]}
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <button
          className="dont-know-button"
          onClick={onGiveUp}
        >
          {lang.dontknow}
        </button>
      )}

      {settings.spellingMode === 'multipleChoice' && (
        <div className="multiple-choice-buttons">
          {buttonNames.map((name, index) => (
            <button key={index} onClick={() => checkGuess(name)}>{name}</button>
          ))}
        </div>
      )}

      {!!settings.pendingSettings && (
        <span className="new-settings-effect">{lang['settingsEffect']}</span>
      )}
    </div>
  );
};

export default AnswerInput;
