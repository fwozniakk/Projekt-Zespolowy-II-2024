package chess_variants_backend
import chess.variant.Antichess
import chess.{Clock, Color, ErrorStr, Game, PromotableRole, Square}
import cats.syntax.all.*

extension (game: Game)
  def as(color: Color): Game = game.withPlayer(color)

  def playMoves(moves: (Square, Square)*): Either[ErrorStr, Game] = playMoveList(moves)

  def playMoveList(moves: Iterable[(Square, Square)]): Either[ErrorStr, Game] =
    moves.toList.foldM(game):
      case (game, (o, d)) => game.playMove(o, d)

  def playMove(
                orig: Square,
                dest: Square,
                promotion: Option[PromotableRole] = None
              ): Either[ErrorStr, Game] =
    game(orig, dest, promotion).map(_._1)

  def withClock(c: Clock) = game.copy(clock = Option(c))

object Main extends App {
  var multigameplayguy = Game(Antichess)
  println(multigameplayguy.sans)
  var gameAfterMoves = multigameplayguy.playMoves(
      Square.E2 -> Square.E4,
      Square.E7 -> Square.E5,
      Square.D1 -> Square.H5
    )
  gameAfterMoves match {
    case Left(error) => println(error)
    case Right(game) => println(game.sans)
  }
}
