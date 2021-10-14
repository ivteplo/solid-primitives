import { createRoot } from "solid-js";
import { createBaseAudio, createAudio, createAudioManager, AudioState } from "../src/index";
import { MockAudio } from './setup';

describe("createBaseAudio", () => {
  test("test static string path", async () => {
    const { player } = createBaseAudio('test.mp3', []);
    const mocked = player as MockAudio;

    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);
    expect(mocked.src).toBe('test.mp3');
  });
  test("test reactive value path", async () => {
    const { player } = createBaseAudio(() => 'test.mp3', []);
    expect(player.src).toBe('test.mp3');
  });
});

describe("createAudio", () => {
  test("test basic play and pause", async () => {
    const { play, pause, player } = createAudio('test.mp3');
    const mocked = player as MockAudio;

    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);

    await play();
    expect(mocked.playing).toBe(true);
    expect(mocked.state).toBe(AudioState.PLAYING);
    
    await pause();
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.PAUSED);
  });
});

describe("createAudioManager", () => {
  test("test manager basic play and pause", () => createRoot(
    async (dispose) => {
      const { play, pause, currentTime, duration, seek, setVolume, player } = createAudioManager('test.mp3');
      const mocked = player as MockAudio;

      expect(currentTime()).toBe(0);
      expect(mocked.playing).toBe(false);
      expect(mocked.volume).toBe(1);
      expect(mocked.state).toBe(AudioState.STOPPED);
      expect(mocked.currentTime).toBe(0);
      expect(mocked.playing).toBe(false);
      expect(mocked.state).toBe(AudioState.STOPPED);

      mocked.duration = 50000;
      console.log('BEGIN -> ', mocked);
      mocked.emit(new Event('loadeddata'));
 
      expect(duration()).toBe(50000);

      await play();
      expect(mocked.playing).toBe(true);
      expect(mocked.state).toBe(AudioState.PLAYING);
      
      await pause();
      expect(mocked.playing).toBe(false);
      expect(mocked.state).toBe(AudioState.PAUSED);

      seek(25000);
      expect(mocked.currentTime).toBe(25000);
      seek(25000);

      setVolume(0.25);
      expect(mocked.volume).toBe(0.25);
      
      dispose();
    }
  ));
});
