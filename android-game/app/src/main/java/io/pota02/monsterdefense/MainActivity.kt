package io.pota02.monsterdefense

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.max
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MonsterDodgeApp()
                }
            }
        }
    }
}

private enum class ScreenState {
    Menu,
    Playing,
    Paused,
    GameOver
}

@Composable
private fun MonsterDodgeApp() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("monster_dodge", Context.MODE_PRIVATE) }

    var screen by rememberSaveable { mutableStateOf(ScreenState.Menu) }
    var soundEnabled by rememberSaveable { mutableStateOf(prefs.getBoolean("sound_enabled", true)) }
    var difficulty by rememberSaveable { mutableFloatStateOf(prefs.getFloat("difficulty", 1f)) }
    var highScore by rememberSaveable { mutableIntStateOf(prefs.getInt("high_score", 0)) }

    var score by rememberSaveable { mutableIntStateOf(0) }
    var playerX by rememberSaveable { mutableFloatStateOf(0.5f) }
    var monsterX by rememberSaveable { mutableFloatStateOf(Random.nextFloat()) }
    var monsterY by rememberSaveable { mutableFloatStateOf(0f) }

    fun persistSettings() {
        prefs.edit()
            .putBoolean("sound_enabled", soundEnabled)
            .putFloat("difficulty", difficulty)
            .apply()
    }

    fun resetGame() {
        score = 0
        playerX = 0.5f
        monsterX = Random.nextFloat()
        monsterY = 0f
        screen = ScreenState.Playing
    }

    LaunchedEffect(screen, difficulty) {
        while (screen == ScreenState.Playing) {
            delay(16)
            val speed = 0.0125f + (difficulty * 0.01f)
            monsterY += speed

            val playerRect = Rect(
                left = playerX - 0.1f,
                top = 0.86f,
                right = playerX + 0.1f,
                bottom = 0.96f
            )
            val monsterRect = Rect(
                left = monsterX - 0.06f,
                top = monsterY,
                right = monsterX + 0.06f,
                bottom = monsterY + 0.1f
            )

            if (playerRect.overlaps(monsterRect)) {
                screen = ScreenState.GameOver
                highScore = max(highScore, score)
                prefs.edit().putInt("high_score", highScore).apply()
            }

            if (monsterY > 1.05f) {
                score += 1
                monsterY = -0.1f
                monsterX = Random.nextFloat().coerceIn(0.1f, 0.9f)
            }
        }
    }

    when (screen) {
        ScreenState.Menu -> MenuScreen(
            soundEnabled = soundEnabled,
            difficulty = difficulty,
            highScore = highScore,
            onSoundChange = {
                soundEnabled = it
                persistSettings()
            },
            onDifficultyChange = {
                difficulty = it
                persistSettings()
            },
            onStart = { resetGame() }
        )

        ScreenState.Playing,
        ScreenState.Paused,
        ScreenState.GameOver -> GameScreen(
            score = score,
            highScore = highScore,
            soundEnabled = soundEnabled,
            isPaused = screen == ScreenState.Paused,
            isGameOver = screen == ScreenState.GameOver,
            playerX = playerX,
            monsterX = monsterX,
            monsterY = monsterY,
            onMoveLeft = { playerX = (playerX - 0.06f).coerceIn(0.1f, 0.9f) },
            onMoveRight = { playerX = (playerX + 0.06f).coerceIn(0.1f, 0.9f) },
            onTogglePause = {
                screen = if (screen == ScreenState.Paused) ScreenState.Playing else ScreenState.Paused
            },
            onToggleSound = {
                soundEnabled = !soundEnabled
                persistSettings()
            },
            onRestart = { resetGame() },
            onBackToMenu = { screen = ScreenState.Menu }
        )
    }
}

@Composable
private fun MenuScreen(
    soundEnabled: Boolean,
    difficulty: Float,
    highScore: Int,
    onSoundChange: (Boolean) -> Unit,
    onDifficultyChange: (Float) -> Unit,
    onStart: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("👾 Monster Dodge", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("Offline • Single Player", color = Color(0xFFBDBDBD), fontSize = 14.sp)
        Spacer(Modifier.height(24.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("High Score: $highScore", fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                Text("Difficulty: ${String.format("%.1f", difficulty)}x")
                Slider(
                    value = difficulty,
                    onValueChange = onDifficultyChange,
                    valueRange = 0.8f..2.0f
                )
                Spacer(Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Sound")
                    Switch(checked = soundEnabled, onCheckedChange = onSoundChange)
                }
            }
        }

        Spacer(Modifier.height(24.dp))
        Button(onClick = onStart, modifier = Modifier.fillMaxWidth()) {
            Text("Start Game")
        }
    }
}

@Composable
private fun GameScreen(
    score: Int,
    highScore: Int,
    soundEnabled: Boolean,
    isPaused: Boolean,
    isGameOver: Boolean,
    playerX: Float,
    monsterX: Float,
    monsterY: Float,
    onMoveLeft: () -> Unit,
    onMoveRight: () -> Unit,
    onTogglePause: () -> Unit,
    onToggleSound: () -> Unit,
    onRestart: () -> Unit,
    onBackToMenu: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1A237E))
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Score: $score", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Best: $highScore", color = Color(0xFFFFF59D))
            }
            Spacer(Modifier.height(8.dp))
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .background(Color(0xFF0D47A1), RoundedCornerShape(12.dp))
            ) {
                val w = size.width
                val h = size.height

                drawRect(
                    color = Color(0xFF8D6E63),
                    topLeft = Offset((playerX - 0.1f) * w, 0.86f * h),
                    size = Size(0.2f * w, 0.1f * h)
                )
                drawRect(
                    color = Color(0xFFFF5252),
                    topLeft = Offset((monsterX - 0.06f) * w, monsterY * h),
                    size = Size(0.12f * w, 0.1f * h)
                )
            }
            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(onClick = onMoveLeft, modifier = Modifier.weight(1f)) { Text("◀ Left") }
                Spacer(Modifier.width(8.dp))
                OutlinedButton(onClick = onMoveRight, modifier = Modifier.weight(1f)) { Text("Right ▶") }
            }
            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Button(onClick = onTogglePause, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3949AB))) {
                    Text(if (isPaused) "Resume" else "Pause")
                }
                Button(onClick = onToggleSound, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00897B))) {
                    Text(if (soundEnabled) "Sound On" else "Sound Off")
                }
            }
        }

        if (isPaused || isGameOver) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xAA000000)),
                contentAlignment = Alignment.Center
            ) {
                Card {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            if (isGameOver) "Game Over" else "Paused",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(8.dp))
                        Text("Score: $score", textAlign = TextAlign.Center)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = onRestart, modifier = Modifier.fillMaxWidth()) { Text("Restart") }
                        Spacer(Modifier.height(8.dp))
                        OutlinedButton(onClick = onBackToMenu, modifier = Modifier.fillMaxWidth()) { Text("Back to Menu") }
                    }
                }
            }
        }
    }
}
