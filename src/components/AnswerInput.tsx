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
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [buttonNames, setButtonNames] = useState<string[]>([]);
  
  const handleClick = () => {
    dispatch(goToNextPokemon());
    setButtonsDisabled(false); // Re-enable buttons for the next round
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
      setButtonsDisabled(true); // Disable buttons after correct guess
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
        setButtonsDisabled(false); // Re-enable buttons for the next round
      }
    }
  };

  const onGiveUp = () => {
    if (isInputRecentlyFocused) {
      inputRef.current?.focus();
    }

    dispatch(revealPokemon({ isCorrect: false }));
    setGuess(pokemonNames[settings.language]);
    setButtonsDisabled(true); // Disable buttons after giving up
  };

  useEffect(() => {
    if (!gameState.answered) {
      setGuess('');
      setButtonsDisabled(false); // Re-enable buttons when the Pokemon changes

      // Generate new button names
      const correctName = pokemonNames.en;

      const randomIndexes = new Set<number>();
      while (randomIndexes.size < 2) {
        const index = Math.floor(Math.random() * POKEMON_NAMES.length);
        if (POKEMON_NAMES[index].names.en !== correctName) {
          randomIndexes.add(index);
        }
      }
      const incorrectNames = Array.from(randomIndexes).map(index => POKEMON_NAMES[index].names.en);

      const newButtonNames = [correctName, ...incorrectNames].map(capitalizeFirstLetter);
      for (let i = newButtonNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newButtonNames[i], newButtonNames[j]] = [newButtonNames[j], newButtonNames[i]];
      }
      setButtonNames(newButtonNames);

    }
  }, [number, gameState.answered, pokemonNames]);

  const handleMultipleChoiceClick = (name: string) => {
    if (name === capitalizeFirstLetter(pokemonNames.en)) {
      checkGuess(name);
    } else {
      onGiveUp();
    }
  };

  return (
    <div className="answer-area">
      <div className="answer-input-container">
        <input
          type="text"
          className={`answer-input ${gameState.answered === 'correct' ? 'answer-input-correct' : gameState.answered === 'incorrect' ? 'answer-input-incorrect' : ''}`}
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
          disabled={settings.spellingMode === 'multipleChoice'}
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
            <button
              key={index}
              onClick={() => handleMultipleChoiceClick(name)}
              disabled={buttonsDisabled}
            >
              {name}
            </button>
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
