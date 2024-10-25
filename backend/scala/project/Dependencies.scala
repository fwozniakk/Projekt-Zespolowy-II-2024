import sbt._

object Dependencies {
  lazy val lilaMaven = "lila-maven" at "https://raw.githubusercontent.com/lichess-org/lila-maven/master"
  lazy val munit = "org.scalameta" %% "munit" % "0.7.29"
  lazy val chess = "org.lichess" %% "scalachess" % "16.3.2"
}
